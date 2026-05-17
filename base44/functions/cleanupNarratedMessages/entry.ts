import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const allMessages = await base44.asServiceRole.entities.NarratedMessage.list();
    const now = new Date();
    let flagged = 0;
    let deleted = 0;

    for (const msg of allMessages) {
      // Flag: completed + 12h passed since completion
      if (msg.is_completed && msg.completed_at && !msg.flagged_for_deletion) {
        const completedAt = new Date(msg.completed_at);
        const hoursElapsed = (now - completedAt) / (1000 * 60 * 60);
        if (hoursElapsed >= 12) {
          await base44.asServiceRole.entities.NarratedMessage.update(msg.id, { flagged_for_deletion: true });
          flagged++;
        }
      }

      // Delete: already flagged
      if (msg.flagged_for_deletion) {
        await base44.asServiceRole.entities.NarratedMessage.delete(msg.id);
        deleted++;
      }

      // Also delete: past expires_at and not completed
      if (msg.expires_at && new Date(msg.expires_at) < now && !msg.is_completed) {
        await base44.asServiceRole.entities.NarratedMessage.delete(msg.id);
        deleted++;
      }
    }

    return Response.json({ success: true, flagged, deleted, checked: allMessages.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});