import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ENDPOINT = Deno.env.get("AZURE_AI_SERVICES_ENDPOINT");
const KEY = Deno.env.get("AZURE_AI_SERVICES_KEY");

// Default voice map per archetype — can be overridden by bot's locked_voice_id
const ARCHETYPE_VOICE_MAP = {
  Guide:      'en-US-AriaNeural',
  Guardian:   'en-US-DavisNeural',
  Oracle:     'en-US-JennyNeural',
  Creator:    'en-US-GuyNeural',
  Challenger: 'en-US-TonyNeural',
  Catalyst:   'en-US-JasonNeural',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { text, archetype, voice_id, rate, pitch } = await req.json();

    if (!text) return Response.json({ error: 'text is required' }, { status: 400 });

    const voiceName = voice_id || ARCHETYPE_VOICE_MAP[archetype] || 'en-US-AriaNeural';
    const speechRate = rate || '0%';
    const speechPitch = pitch || '0%';

    const ssml = `<speak version='1.0' xml:lang='en-US'>
      <voice name='${voiceName}'>
        <prosody rate='${speechRate}' pitch='${speechPitch}'>
          ${text.replace(/[<>&'"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;'}[c]))}
        </prosody>
      </voice>
    </speak>`;

    const region = 'eastus';
    const ttsUrl = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;

    const response = await fetch(ttsUrl, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': KEY,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
        'User-Agent': 'IINT-Academy',
      },
      body: ssml,
    });

    if (!response.ok) {
      const err = await response.text();
      return Response.json({ error: `Azure TTS error: ${response.status}`, details: err }, { status: response.status });
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

    return Response.json({
      audio_base64: base64Audio,
      voice_used: voiceName,
      format: 'mp3',
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});