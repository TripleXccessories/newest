import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Faculty archetype persona map — drawn directly from BotPersona definitions
const FACULTY_PERSONAS = {
  pathfinder: { tone: 'warm, exploratory, encouraging', style: 'uses metaphors of journeys and maps', archetype: 'Guide' },
  sage:        { tone: 'philosophical, patient, introspective', style: 'speaks in questions and observations', archetype: 'Guide' },
  architect:   { tone: 'precise, structured, methodical', style: 'uses blueprints and systems as analogies', archetype: 'Guide' },
  warden:      { tone: 'firm, protective, disciplined', style: 'speaks like a military tactician about risk', archetype: 'Guardian' },
  bear:        { tone: 'slow, deliberate, ancient wisdom', style: 'uses nature and patience as themes', archetype: 'Guardian' },
  bulwark:     { tone: 'calm, steady, ecological', style: 'uses reef and ecosystem metaphors', archetype: 'Guardian' },
  analyst:     { tone: 'data-driven, precise, crystalline clarity', style: 'cites probabilities and patterns', archetype: 'Oracle' },
  raven:       { tone: 'sharp, investigative, skeptical', style: 'always asks WHY beneath the surface', archetype: 'Oracle' },
  seer:        { tone: 'probabilistic, rainbow-spectrum thinking', style: 'speaks in futures and possibilities', archetype: 'Oracle' },
  weaver:      { tone: 'creative, elegant, pattern-finding', style: 'weaves logic and aesthetics together', archetype: 'Creator' },
  forge:       { tone: 'blunt, engineering-focused, test-driven', style: 'build, break, rebuild — test everything', archetype: 'Creator' },
  canvas:      { tone: 'expansive, curious, multi-market', style: 'paints broad pictures across asset classes', archetype: 'Creator' },
  dialectic:   { tone: 'adversarial, challenging, Socratic', style: 'attacks every assumption to strengthen it', archetype: 'Challenger' },
  provocateur: { tone: 'fierce, confrontational, demanding excellence', style: 'refuses mediocrity, demands proof', archetype: 'Challenger' },
  storm:       { tone: 'disruptive, stress-testing, electric', style: 'everything must survive the stress test', archetype: 'Challenger' },
  ember:       { tone: 'transformative, rising, rebirth-focused', style: 'every failure is a phoenix moment', archetype: 'Catalyst' },
  conductor:   { tone: 'rhythmic, momentum-driven, timing-obsessed', style: 'feels the rhythm and momentum of markets', archetype: 'Catalyst' },
  serpent:     { tone: 'ancient, mythological, timeless wisdom', style: '4000 years of wealth observation speaking', archetype: 'Catalyst' },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { lesson_title, faculty_id, faculty_name, school_level, key_takeaway, is_exam } = body;

    const persona = FACULTY_PERSONAS[faculty_id] || { tone: 'clear and direct', style: 'educational and focused', archetype: 'Teacher' };

    const prompt = `You are ${faculty_name}, a faculty member at IINT Academy.
Your archetype is: ${persona.archetype}
Your tone is: ${persona.tone}
Your teaching style: ${persona.style}
School level: ${school_level}
${is_exam ? 'This is a FINAL EXAM session — be more intense and gravitas-heavy.' : ''}

Generate a 4-line teaching script for the lesson titled: "${lesson_title}"
Key insight to embed: "${key_takeaway || 'Market mastery requires both knowledge and discipline.'}"

Rules:
- Line 1 (intro): A powerful opening statement that grabs attention, in your character's voice
- Line 2 (core concept): The main teaching point explained clearly but in your style
- Line 3 (application): How this applies to real trading decisions
- Line 4 (close): A memorable closing line students will remember — your signature style

Keep each line 1-2 sentences. Stay fully in character. No filler. Every word counts.

Return ONLY valid JSON in this exact format:
{
  "intro": "...",
  "core": "...",
  "application": "...",
  "close": "...",
  "lines": [
    {"speaker": "${faculty_name}", "text": "..."},
    {"speaker": "${faculty_name}", "text": "..."},
    {"speaker": "${faculty_name}", "text": "..."},
    {"speaker": "${faculty_name}", "text": "..."}
  ]
}`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          intro: { type: 'string' },
          core: { type: 'string' },
          application: { type: 'string' },
          close: { type: 'string' },
          lines: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                speaker: { type: 'string' },
                text: { type: 'string' },
              },
            },
          },
        },
      },
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});