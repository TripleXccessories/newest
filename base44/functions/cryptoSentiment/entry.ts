import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a crypto market sentiment analyst. Search the latest news, social media trends, Reddit, Twitter/X, and crypto forums for sentiment on Bitcoin (BTC), Ethereum (ETH), and the broader crypto market right now.

Return a JSON object with:
- overall_score: number from 0 to 100 (0=extreme fear, 50=neutral, 100=extreme greed)
- overall_label: one of "Extreme Fear", "Fear", "Neutral", "Greed", "Extreme Greed"
- btc_score: number 0-100
- eth_score: number 0-100
- trend: "rising" | "falling" | "stable"
- key_signals: array of 3 strings describing the top sentiment drivers right now
- last_updated: ISO timestamp string`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          overall_score: { type: "number" },
          overall_label: { type: "string" },
          btc_score: { type: "number" },
          eth_score: { type: "number" },
          trend: { type: "string" },
          key_signals: { type: "array", items: { type: "string" } },
          last_updated: { type: "string" }
        }
      }
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});