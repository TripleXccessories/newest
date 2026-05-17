import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Visual style map per archetype
const ARCHETYPE_VISUAL_STYLES = {
  Guide:        'soft luminous blues and teals, flowing organic shapes, warmth and openness, impressionistic illustration style',
  Guardian:     'deep greens and earth tones, fortress walls and ancient stone, protective geometry, epic realism',
  Oracle:       'prismatic crystals and light refraction, deep purple and violet spectrum, data streams and fractals, ethereal digital art',
  Creator:      'vibrant creative energy, workshop tools and blueprints, warm oranges and pinks, dynamic motion lines',
  Challenger:   'stark contrasts, red and black tension, sharp angular forms, storm electricity, dramatic chiaroscuro',
  Catalyst:     'transformation imagery, phoenix fire, momentum waves, cosmic energy flows, gold and amber spectrum',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { concept, faculty_id, archetype, lesson_title, school_level } = body;

    const visualStyle = ARCHETYPE_VISUAL_STYLES[archetype] || 'clean modern financial illustration, dark background, teal accents';

    const imagePrompt = `A conceptual educational illustration representing "${concept}" in the context of trading and markets.
Visual style: ${visualStyle}
School level aesthetic: ${school_level === 'University' ? 'complex, sophisticated, layered' : school_level === 'High School' ? 'dynamic, energetic, detailed' : 'clear, accessible, foundational'}
The image should feel like a watermark-quality concept art piece — symbolic rather than literal.
Dark background with the concept rendered in glowing, thematic colors.
No text. No people. Pure concept visualization.
Aspect ratio: wide landscape. Ultra high quality illustration.`;

    const result = await base44.asServiceRole.integrations.Core.GenerateImage({
      prompt: imagePrompt,
    });

    return Response.json({ image_url: result?.url || null, prompt_used: imagePrompt });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});