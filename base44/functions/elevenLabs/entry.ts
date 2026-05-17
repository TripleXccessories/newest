import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const XI_KEY = Deno.env.get("ELEVENLABS_API_KEY");
const XI_BASE = "https://api.elevenlabs.io/v1";

const headers = () => ({
  "xi-api-key": XI_KEY,
  "Content-Type": "application/json",
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { action } = body;

    // ── LIST VOICES ──────────────────────────────────────────────────────────
    if (action === "list_voices") {
      const res = await fetch(`${XI_BASE}/voices?show_legacy=true`, { headers: headers() });
      const data = await res.json();
      return Response.json({ voices: data.voices || [] });
    }

    // ── TEXT TO SPEECH ────────────────────────────────────────────────────────
    if (action === "tts") {
      const { voice_id, text, model_id = "eleven_multilingual_v2", stability = 0.5, similarity_boost = 0.75, style = 0, language_code } = body;
      if (!voice_id || !text) return Response.json({ error: "voice_id and text required" }, { status: 400 });

      const payload = {
        text,
        model_id,
        voice_settings: { stability, similarity_boost, style, use_speaker_boost: true },
      };
      if (language_code) payload.language_code = language_code;

      const res = await fetch(`${XI_BASE}/text-to-speech/${voice_id}`, {
        method: "POST",
        headers: { ...headers(), "Accept": "audio/mpeg" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.text();
        return Response.json({ error: `ElevenLabs TTS error: ${res.status}`, details: err }, { status: res.status });
      }

      const buf = await res.arrayBuffer();
      const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
      return Response.json({ audio_base64: b64, format: "mp3" });
    }

    // ── VOICE CHANGER (Speech to Speech) ────────────────────────────────────
    if (action === "voice_changer") {
      const { voice_id, audio_base64, model_id = "eleven_english_sts_v2" } = body;
      if (!voice_id || !audio_base64) return Response.json({ error: "voice_id and audio_base64 required" }, { status: 400 });

      // Convert base64 to binary
      const binaryStr = atob(audio_base64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);

      const formData = new FormData();
      formData.append("audio", new Blob([bytes], { type: "audio/mpeg" }), "input.mp3");
      formData.append("model_id", model_id);

      const res = await fetch(`${XI_BASE}/speech-to-speech/${voice_id}/stream`, {
        method: "POST",
        headers: { "xi-api-key": XI_KEY, "Accept": "audio/mpeg" },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.text();
        return Response.json({ error: `Voice changer error: ${res.status}`, details: err }, { status: res.status });
      }

      const buf = await res.arrayBuffer();
      const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
      return Response.json({ audio_base64: b64, format: "mp3" });
    }

    // ── CLONE VOICE (Instant Voice Cloning) ──────────────────────────────────
    if (action === "clone_voice") {
      const { name, description = "", file_urls = [] } = body;
      if (!name || !file_urls.length) return Response.json({ error: "name and file_urls required" }, { status: 400 });

      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);

      // Fetch each audio file and attach
      for (let i = 0; i < file_urls.length; i++) {
        const fileRes = await fetch(file_urls[i]);
        const blob = await fileRes.blob();
        formData.append("files", blob, `sample_${i}.mp3`);
      }

      const res = await fetch(`${XI_BASE}/voices/add`, {
        method: "POST",
        headers: { "xi-api-key": XI_KEY },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.text();
        return Response.json({ error: `Clone error: ${res.status}`, details: err }, { status: res.status });
      }

      const data = await res.json();
      return Response.json({ voice_id: data.voice_id, success: true });
    }

    // ── DELETE VOICE ──────────────────────────────────────────────────────────
    if (action === "delete_voice") {
      const { voice_id } = body;
      if (!voice_id) return Response.json({ error: "voice_id required" }, { status: 400 });

      const res = await fetch(`${XI_BASE}/voices/${voice_id}`, {
        method: "DELETE",
        headers: headers(),
      });

      return Response.json({ success: res.ok });
    }

    // ── GET VOICE DETAILS ─────────────────────────────────────────────────────
    if (action === "get_voice") {
      const { voice_id } = body;
      if (!voice_id) return Response.json({ error: "voice_id required" }, { status: 400 });

      const res = await fetch(`${XI_BASE}/voices/${voice_id}`, { headers: headers() });
      const data = await res.json();
      return Response.json({ voice: data });
    }

    // ── GET USER SUBSCRIPTION INFO ────────────────────────────────────────────
    if (action === "subscription_info") {
      const res = await fetch(`${XI_BASE}/user/subscription`, { headers: headers() });
      const data = await res.json();
      return Response.json({ subscription: data });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});