import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * syncFXLibrary — Fetches royalty-free SFX from Freesound public API
 * and upserts them into FXPlugin records.
 * Called manually from the Studio or via a scheduled automation.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const { query = 'cinematic sfx', page_size = 20 } = await req.json().catch(() => ({}));

    // Freesound public search (no-key preview endpoint for royalty-free)
    const url = `https://freesound.org/apiv2/search/text/?query=${encodeURIComponent(query)}&page_size=${page_size}&filter=license:%22Creative+Commons+0%22&fields=id,name,description,duration,tags,previews`;

    let sounds = [];
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Token ${Deno.env.get('FREESOUND_API_KEY') || ''}` }
      });
      if (res.ok) {
        const data = await res.json();
        sounds = data.results || [];
      }
    } catch (_) {
      // Freesound not configured — return curated built-in library
    }

    // Built-in curated royalty-free plugin definitions (always available)
    const builtInPlugins = [
      { name: 'Deep Reverb', plugin_type: 'reverb', provider: 'IINT Built-in', icon_emoji: '🌊', parameters: { wet: 0.6, dry: 0.4, decay: 2.5, pre_delay: 20 }, audio_sample_urls: [] },
      { name: 'Slapback Delay', plugin_type: 'delay', provider: 'IINT Built-in', icon_emoji: '🔁', parameters: { time: 120, feedback: 0.3, mix: 0.5 }, audio_sample_urls: [] },
      { name: 'Warm Chorus', plugin_type: 'chorus', provider: 'IINT Built-in', icon_emoji: '🎵', parameters: { rate: 1.2, depth: 0.4, mix: 0.5 }, audio_sample_urls: [] },
      { name: 'Tape Distortion', plugin_type: 'distortion', provider: 'IINT Built-in', icon_emoji: '⚡', parameters: { drive: 0.4, tone: 0.6, output: 0.8 }, audio_sample_urls: [] },
      { name: '3-Band EQ', plugin_type: 'eq', provider: 'IINT Built-in', icon_emoji: '🎚️', parameters: { low: 0, mid: 0, high: 0, low_freq: 200, high_freq: 8000 }, audio_sample_urls: [] },
      { name: 'Glue Compressor', plugin_type: 'compressor', provider: 'IINT Built-in', icon_emoji: '🗜️', parameters: { threshold: -12, ratio: 4, attack: 10, release: 100, makeup: 3 }, audio_sample_urls: [] },
      { name: 'Low Pass Filter', plugin_type: 'filter', provider: 'IINT Built-in', icon_emoji: '🔽', parameters: { cutoff: 2000, resonance: 0.7, type: 'lowpass' }, audio_sample_urls: [] },
      { name: 'Pitch Shifter', plugin_type: 'pitch', provider: 'IINT Built-in', icon_emoji: '🎹', parameters: { semitones: 0, cents: 0, formant: false }, audio_sample_urls: [] },
    ];

    // Sync built-in plugins
    const existing = await base44.asServiceRole.entities.FXPlugin.list();
    const existingNames = new Set(existing.map(p => p.name));
    let added = 0;

    for (const plugin of builtInPlugins) {
      if (!existingNames.has(plugin.name)) {
        await base44.asServiceRole.entities.FXPlugin.create({
          ...plugin,
          is_active: true,
          provider_version: '1.0.0',
          last_synced_at: new Date().toISOString(),
        });
        added++;
      }
    }

    // Sync Freesound results as FX plugins if available
    for (const sound of sounds) {
      const name = `FS: ${sound.name}`.substring(0, 80);
      if (!existingNames.has(name)) {
        await base44.asServiceRole.entities.FXPlugin.create({
          name,
          description: sound.description?.substring(0, 200),
          plugin_type: 'custom',
          provider: 'Freesound (CC0)',
          provider_version: String(sound.id),
          audio_sample_urls: sound.previews ? [sound.previews['preview-hq-mp3'] || sound.previews['preview-lq-mp3']] : [],
          parameters: {},
          is_active: true,
          last_synced_at: new Date().toISOString(),
          icon_emoji: '🎧',
        });
        added++;
      }
    }

    return Response.json({ success: true, added, total_built_in: builtInPlugins.length, freesound_results: sounds.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});