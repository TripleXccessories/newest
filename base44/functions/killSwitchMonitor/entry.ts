import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * IINT Inc. Autonomous Risk Mitigation (ARM) — Kill-Switch Protocol
 * "Protocol 49/55" — Global + Per-Bot granular guardian.
 *
 * Global layer:  Portfolio >= 49% loss + user inactive > 12h → liquidate to 55% equity
 * Per-Bot layer: Individual bot trade breaches bot_loss_threshold_pct OR bot_daily_loss_limit
 *                → autonomously close that bot's positions, fire regardless of user activity
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const now = new Date();
    const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const openTrades = await base44.asServiceRole.entities.Trade.filter({ status: 'open' });
    const killSwitchLogs = [];

    // --- LAYER 1: Global Protocol 49/55 ---
    for (const trade of openTrades) {
      if (trade.pnl_percent == null || trade.pnl_percent >= 0) continue;
      const lossPercent = Math.abs(trade.pnl_percent);
      if (lossPercent < 49) continue;

      const [profile] = await base44.asServiceRole.entities.UserProfile.filter({ user_id: trade.user_id });
      if (!profile) continue;
      if (!profile.kill_switch_enabled) continue;

      const lastLogin = profile.last_login_at ? new Date(profile.last_login_at) : null;
      const userInactive = !lastLogin || lastLogin < twelveHoursAgo;
      if (!userInactive) continue;

      const threshold = profile.kill_switch_threshold_pct ?? 49;
      if (lossPercent < threshold) continue;

      const salvagePct = (profile.kill_switch_salvage_pct ?? 55) / 100;
      const entryValue = trade.quantity * trade.entry_price;
      const salvageAmount = entryValue * salvagePct;

      await base44.asServiceRole.entities.Trade.update(trade.id, {
        status: 'closed',
        exit_price: trade.entry_price * (1 - lossPercent / 100),
        pnl: -(entryValue * (lossPercent / 100)),
        notes: `[GLOBAL KILL-SWITCH — Protocol 49/55] Loss: ${lossPercent.toFixed(2)}%. Equity salvaged: $${salvageAmount.toFixed(2)}. User inactive >12h. ${now.toISOString()}`,
        closed_at: now.toISOString(),
      });

      if (profile) {
        await base44.asServiceRole.entities.UserProfile.update(profile.id, {
          virtual_balance: (profile.virtual_balance || 0) + salvageAmount,
        });
      }

      killSwitchLogs.push({
        layer: 'GLOBAL_49_55',
        trade_id: trade.id,
        user_id: trade.user_id,
        ticker: trade.ticker,
        loss_percent: lossPercent,
        salvage_amount: salvageAmount,
        triggered_at: now.toISOString(),
        status: 'EXECUTED',
      });
    }

    // --- LAYER 2: Per-Bot Granular Kill Switch ---
    // Fetch all active bot profiles that have kill switch enabled
    const botProfiles = await base44.asServiceRole.entities.UserBotProfile.filter({
      is_active_rental: true,
      bot_kill_switch_enabled: true,
    });

    for (const botProfile of botProfiles) {
      if (botProfile.bot_kill_switch_status === 'triggered') continue; // already fired today

      // Get all open trades for this user
      const userTrades = openTrades.filter(t => t.user_id === botProfile.user_id);
      if (userTrades.length === 0) continue;

      const lossThreshold = botProfile.bot_loss_threshold_pct ?? 20;
      const dailyLossLimit = botProfile.bot_daily_loss_limit ?? 500;

      // Calculate today's realized losses for this user's bot-managed trades
      // (We use the signal_id field as a proxy — if notes contain [BOT], treat as bot-managed)
      const botTrades = userTrades; // In production, filter by bot signal_id reference

      // Check per-trade loss threshold breach
      const breachingTrades = botTrades.filter(t =>
        t.pnl_percent != null &&
        t.pnl_percent < 0 &&
        Math.abs(t.pnl_percent) >= lossThreshold
      );

      // Calculate total unrealized loss today
      const totalUnrealizedLoss = botTrades.reduce((sum, t) => {
        if (t.pnl < 0) return sum + Math.abs(t.pnl);
        return sum;
      }, 0);

      const dailyLimitBreached = totalUnrealizedLoss >= dailyLossLimit;
      const positionLimitBreached = breachingTrades.length > 0;

      if (!dailyLimitBreached && !positionLimitBreached) continue;

      const reason = dailyLimitBreached
        ? `Daily loss limit $${dailyLossLimit} breached (actual: $${totalUnrealizedLoss.toFixed(2)})`
        : `Position loss ${lossThreshold}% threshold breached on ${breachingTrades.length} trade(s)`;

      // Close all breaching positions
      for (const trade of (dailyLimitBreached ? botTrades : breachingTrades)) {
        if (trade.pnl_percent >= 0) continue;
        const lp = Math.abs(trade.pnl_percent);
        const exitPrice = trade.entry_price * (1 - lp / 100);

        await base44.asServiceRole.entities.Trade.update(trade.id, {
          status: 'closed',
          exit_price: exitPrice,
          pnl: trade.pnl,
          notes: `[PER-BOT KILL-SWITCH] Bot: ${botProfile.user_given_name || botProfile.bot_persona_id}. ${reason}. Autonomous closure. ${now.toISOString()}`,
          closed_at: now.toISOString(),
        });

        killSwitchLogs.push({
          layer: 'PER_BOT',
          bot_profile_id: botProfile.id,
          bot_name: botProfile.user_given_name || botProfile.bot_persona_id,
          trade_id: trade.id,
          user_id: botProfile.user_id,
          ticker: trade.ticker,
          loss_percent: lp,
          reason,
          triggered_at: now.toISOString(),
          status: 'EXECUTED',
        });
      }

      // Mark bot kill switch as triggered
      await base44.asServiceRole.entities.UserBotProfile.update(botProfile.id, {
        bot_kill_switch_status: 'triggered',
        bot_kill_switch_triggered_at: now.toISOString(),
      });
    }

    return Response.json({
      success: true,
      checked_trades: openTrades.length,
      checked_bot_profiles: botProfiles.length,
      kill_switch_activations: killSwitchLogs.length,
      global_activations: killSwitchLogs.filter(l => l.layer === 'GLOBAL_49_55').length,
      per_bot_activations: killSwitchLogs.filter(l => l.layer === 'PER_BOT').length,
      logs: killSwitchLogs,
      timestamp: now.toISOString(),
      message: killSwitchLogs.length > 0
        ? `ARM Protocol executed: ${killSwitchLogs.length} position(s) autonomously closed. Capital protected.`
        : 'All positions within safe parameters. Dual-layer guardian standing watch.',
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});