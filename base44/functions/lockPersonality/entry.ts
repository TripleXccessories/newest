import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Locks a BotPersona's personality traits and voice — admin only
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { bot_id, personality_lock, voice_lock, locked_voice_id, locked_traits } = await req.json();

    if (!bot_id) return Response.json({ error: 'bot_id is required' }, { status: 400 });

    const updateData = {};

    if (personality_lock !== undefined) {
      updateData.personality_locked = personality_lock;
      if (locked_traits) updateData.locked_traits = locked_traits;
    }

    if (voice_lock !== undefined) {
      updateData.voice_locked = voice_lock;
      if (locked_voice_id) updateData.locked_voice_id = locked_voice_id;
    }

    await base44.asServiceRole.entities.BotPersona.update(bot_id, updateData);

    return Response.json({ success: true, bot_id, updated: updateData });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});