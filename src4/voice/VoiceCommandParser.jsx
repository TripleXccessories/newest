/**
 * IINT Voice Command Parser
 * ─────────────────────────────────────────────────────────────────────────────
 * Device-agnostic command interpreter.
 * Input: raw transcript string
 * Output: structured command object
 *
 * Designed to accept input from ANY voice bridge:
 *   - Browser Web Speech API (current prototype)
 *   - Amazon Alexa (Lambda skill → websocket)
 *   - Google Assistant / Gemini (Dialogflow → webhook)
 *   - Microsoft Copilot (Bot Framework → relay)
 *   - Samsung Bixby / Galaxy Watch (Bixby Capsule → API relay)
 *   - Apple Siri Shortcuts (Shortcuts URL scheme → bridge)
 */

const INTENT_PATTERNS = [
  // Portfolio queries
  { intent: 'portfolio_summary',  patterns: [/my (portfolio|balance|positions|holdings)/i, /how am i (doing|performing)/i, /portfolio (status|update|summary)/i] },
  { intent: 'position_query',     patterns: [/what('s| is) my (.+) (position|holding|trade)/i, /how('s| is) (.+) (doing|performing|looking)/i, /(check|show) (.+) (position|trade)/i] },
  { intent: 'profit_query',       patterns: [/(profit|pnl|gain|loss) on (.+)/i, /how much (did|have) i (made?|earned?|lost?) on (.+)/i, /(.+) (profit|pnl)/i] },
  { intent: 'suggestion_request', patterns: [/(suggest|recommend|advise|what should i|what do you think)/i, /(best|better) (trade|opportunity|move|position)/i, /find me (a|the) (next|best|better)/i, /maximize (profit|gains|returns)/i] },
  { intent: 'execute_buy',        patterns: [/buy (.+)/i, /go long on (.+)/i, /enter (.+)/i, /open (a )?position on (.+)/i] },
  { intent: 'execute_sell',       patterns: [/sell (.+)/i, /close (.+) (position|trade)?/i, /exit (.+)/i, /go short on (.+)/i] },
  { intent: 'market_sentiment',   patterns: [/(market|sentiment|trend) (update|check|status|analysis)/i, /what('s| is) the market (doing|looking like)/i] },
  { intent: 'risk_check',         patterns: [/(risk|exposure|drawdown) (check|status|level)/i, /am i (overexposed|at risk)/i] },
  { intent: 'bot_status',         patterns: [/(status|how are you|what are you working on|give me an update)/i] },
  { intent: 'stop_listening',     patterns: [/(stop|cancel|never mind|that('s| is) all|goodbye|bye)/i] },
];

const TICKER_ALIASES = {
  'bitcoin': 'BTC', 'btc': 'BTC', 'bit coin': 'BTC',
  'ethereum': 'ETH', 'eth': 'ETH', 'ether': 'ETH',
  'solana': 'SOL', 'sol': 'SOL',
  'apple': 'AAPL', 'aapl': 'AAPL',
  'tesla': 'TSLA', 'tsla': 'TSLA',
  'nvidia': 'NVDA', 'nvda': 'NVDA',
  'spy': 'SPY', 's&p': 'SPY', 's and p': 'SPY',
  'gold': 'GLD', 'gld': 'GLD',
  'avalanche': 'AVAX', 'avax': 'AVAX',
  'chainlink': 'LINK', 'link': 'LINK',
};

export function parseCommand(transcript, knownBots = []) {
  const text = transcript.trim().toLowerCase();

  // Check if a specific bot is being called
  let targetBot = null;
  for (const bot of knownBots) {
    const botName = (bot._ubp?.user_given_name || bot.name || '').toLowerCase();
    if (text.includes(botName.toLowerCase()) || text.includes(bot.name?.toLowerCase())) {
      targetBot = bot;
      break;
    }
  }

  // Extract ticker
  let ticker = null;
  for (const [alias, symbol] of Object.entries(TICKER_ALIASES)) {
    if (text.includes(alias)) { ticker = symbol; break; }
  }
  // Also catch uppercase tickers like BTC, ETH, AAPL
  const tickerMatch = transcript.match(/\b([A-Z]{2,5})\b/);
  if (!ticker && tickerMatch) ticker = tickerMatch[1];

  // Match intent
  let matchedIntent = 'general_query';
  for (const { intent, patterns } of INTENT_PATTERNS) {
    if (patterns.some(p => p.test(text))) { matchedIntent = intent; break; }
  }

  // Extract quantity / dollar amount
  const amountMatch = text.match(/\$?([\d,]+(\.\d+)?)\s*(dollars?|usd|shares?|units?|coins?)?/i);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '')) : null;

  return {
    raw: transcript,
    intent: matchedIntent,
    ticker,
    amount,
    targetBot,
    confidence: targetBot ? 'high' : ticker ? 'medium' : 'low',
    timestamp: new Date().toISOString(),
  };
}

export function intentToPrompt(command, bot, portfolioContext = '') {
  const botName = bot._ubp?.user_given_name || bot.name;
  const ticker = command.ticker ? ` regarding ${command.ticker}` : '';
  const portfolio = portfolioContext ? `\n\nPortfolio context: ${portfolioContext}` : '';

  const prompts = {
    portfolio_summary:  `The user is asking for a portfolio summary and performance update. Respond as ${botName} — give a brief, insightful overview of their virtual positions, P&L, and one key observation. Keep it sharp.${portfolio}`,
    position_query:     `The user asked about their${ticker} position. As ${botName}, give a focused update on this holding — entry context, current direction based on sentiment, and your archetype-specific take.${portfolio}`,
    profit_query:       `The user wants to know profit/loss info${ticker}. As ${botName}, deliver the P&L update with your personality — mention whether to hold, take profit, or cut.${portfolio}`,
    suggestion_request: `The user is asking for your best trading suggestion right now. As ${botName} (${bot.archetype} archetype), scan the current market context, apply your strategy bias, and recommend the highest-potential opportunity with reasoning. Be specific.${portfolio}`,
    execute_buy:        `The user said they want to BUY${ticker}. As ${botName}, validate this idea — agree or push back based on your archetype. Give a brief risk/reward take and confirm or challenge the timing.${portfolio}`,
    execute_sell:       `The user said they want to SELL${ticker}. As ${botName}, react to this — is it the right move? Apply your archetype's lens and give a decisive response.${portfolio}`,
    market_sentiment:   `The user wants a market sentiment update. As ${botName} (${bot.archetype}), give a crisp, opinionated read on current market conditions and what it means for their strategy.`,
    risk_check:         `The user is asking about their risk exposure. As ${botName}, assess their current risk level and give your archetype-specific guidance on whether they're over- or under-exposed.${portfolio}`,
    bot_status:         `The user asked for your status/update. As ${botName}, give a brief, in-character update — what you're watching, what's on your radar, and one key thing the user should know right now.`,
    general_query:      `The user said: "${command.raw}". Respond as ${botName} (${bot.archetype} archetype, ${bot.school} school). Stay fully in character and be helpful, insightful, and concise.`,
  };

  return prompts[command.intent] || prompts.general_query;
}