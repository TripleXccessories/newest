import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const finding = payload.data;
    if (!finding) return Response.json({ ok: true });

    // Find admin users to notify
    const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });

    const typeLabels = {
      bug: '🐛 Bug', visual_glitch: '👁️ Visual Glitch', performance_issue: '⚡ Performance',
      audio_issue: '🔊 Audio Issue', crash: '💥 Crash', unexpected_behavior: '🤔 Unexpected Behavior',
      easter_egg_hint: '🥚 Easter Egg Hint', script_prompt: '📜 Script Prompt',
      passed_no_issues: '✅ Passed — No Issues', feature_suggestion: '💡 Feature Suggestion',
    };

    const subject = `[IINT Scope] New Finding: ${finding.title}`;
    const body = `
A tester submitted a new scope finding on IINT INC.

📋 Scope: ${finding.scope_title || 'Unknown'}
🔍 Type: ${typeLabels[finding.finding_type] || finding.finding_type}
📝 Title: ${finding.title}
👤 Tester: ${finding.user_email || 'Unknown'}

📱 Device: ${finding.device_type} — ${finding.device_model || 'N/A'}
🌐 Browser: ${finding.browser} ${finding.browser_version || ''}
💻 OS: ${finding.os_version || 'N/A'}
📐 Resolution: ${finding.screen_resolution || 'N/A'}

📄 Description:
${finding.description}

${finding.steps_to_reproduce ? `🔁 Steps to Reproduce:\n${finding.steps_to_reproduce}` : ''}

Review findings at: https://app.base44.com (Scope Testing → Admin Panel)
    `.trim();

    for (const admin of admins) {
      if (admin.email) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: admin.email,
          subject,
          body,
          from_name: 'IINT Scope Testing',
        });
      }
    }

    return Response.json({ ok: true, notified: admins.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});