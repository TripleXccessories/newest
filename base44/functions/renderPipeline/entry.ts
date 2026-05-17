import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const OPENAI_KEY = Deno.env.get("OPENAI_API_KEY");

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

    const body = await req.json();
    const { action } = body;

    // ── SINGLE FRAME RENDER ──────────────────────────────────────────────────
    if (action === 'render_frame') {
      const { prompt, persona_name, frame_id } = body;
      if (!prompt) return Response.json({ error: 'prompt required' }, { status: 400 });

      if (!OPENAI_KEY) {
        return Response.json({ error: 'OPENAI_API_KEY not set. Please add it in Settings → Secrets.' }, { status: 400 });
      }

      const dalle = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: prompt.slice(0, 4000),
          n: 1,
          size: '1792x1024',
          quality: 'standard',
          style: 'vivid',
        }),
      });

      if (!dalle.ok) {
        const err = await dalle.text();
        return Response.json({ error: `DALL-E error: ${dalle.status}`, details: err }, { status: dalle.status });
      }

      const result = await dalle.json();
      const image_url = result?.data?.[0]?.url;
      const revised_prompt = result?.data?.[0]?.revised_prompt;

      if (!image_url) return Response.json({ error: 'No image URL returned from DALL-E' }, { status: 500 });

      // Upload to Base44 storage
      const imgRes = await fetch(image_url);
      const imgBlob = await imgRes.blob();
      const formData = new FormData();
      formData.append('file', imgBlob, `${persona_name || 'frame'}_${frame_id || Date.now()}.png`);

      const uploadRes = await base44.asServiceRole.integrations.Core.UploadFile({ file: imgBlob });
      const stored_url = uploadRes?.file_url || image_url;

      return Response.json({
        success: true,
        image_url: stored_url,
        original_url: image_url,
        revised_prompt,
        frame_id,
        persona_name,
      });
    }

    // ── BATCH RENDER (up to 5 frames) ────────────────────────────────────────
    if (action === 'render_batch') {
      const { frames } = body; // [{ frame_id, prompt, persona_name }]
      if (!frames?.length) return Response.json({ error: 'frames array required' }, { status: 400 });
      if (!OPENAI_KEY) return Response.json({ error: 'OPENAI_API_KEY not set' }, { status: 400 });

      const limited = frames.slice(0, 5); // cap at 5 to avoid timeout
      const results = [];

      for (const frame of limited) {
        const dalle = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: (frame.prompt || '').slice(0, 4000),
            n: 1,
            size: '1792x1024',
            quality: 'standard',
            style: 'vivid',
          }),
        });

        if (!dalle.ok) {
          results.push({ frame_id: frame.frame_id, error: `DALL-E ${dalle.status}` });
          continue;
        }

        const result = await dalle.json();
        const image_url = result?.data?.[0]?.url;
        results.push({
          frame_id: frame.frame_id,
          persona_name: frame.persona_name,
          image_url: image_url || null,
          revised_prompt: result?.data?.[0]?.revised_prompt,
          success: !!image_url,
        });
      }

      return Response.json({ success: true, results, rendered: results.filter(r => r.success).length });
    }

    // ── GENERATE PROMPT FOR FRAME ────────────────────────────────────────────
    if (action === 'generate_prompt') {
      const { persona_id } = body;
      if (!persona_id) return Response.json({ error: 'persona_id required' }, { status: 400 });

      const persona = await base44.asServiceRole.entities.BotPersona.get(persona_id);
      if (!persona) return Response.json({ error: 'Persona not found' }, { status: 404 });

      const prompt = [
        `${persona.name}, ${persona.role_title}.`,
        persona.reveal_desc || '',
        persona.art_direction ? `Art direction: ${persona.art_direction}` : '',
        `Color palette: primary ${persona.primary_color}, secondary ${persona.secondary_color || '#1e293b'}.`,
        persona.environment_desc ? `Environment: ${persona.environment_name} — ${persona.environment_desc.slice(0, 200)}` : '',
        'Cinematic wide shot, volumetric lighting, 8K render, highly detailed, professional digital art.',
      ].filter(Boolean).join(' ');

      return Response.json({ success: true, prompt, persona_name: persona.name });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});