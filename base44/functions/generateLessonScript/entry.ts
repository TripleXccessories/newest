import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const {
      lesson_title,
      category,
      sub_category,
      school_level,
      character_name,
      character_archetype,
      character_traits,
      character_signature_line,
      storyline_active,
      storyline_chapter,
      previous_lessons_context,  // array of last 3 lesson summaries for continuity
      tone_override,             // optional manual tone nudge
      save_to_db,                // boolean - persist as Lesson entity
      course_id,
      lesson_number,
    } = await req.json();

    // Tone profile per school level
    const toneProfiles = {
      'Kindergarten':  { humor: 'very high', complexity: 'very low',  entertainment: 'maximum', story_intensity: 'light and playful', style: 'warm, encouraging, silly, short sentences, lots of enthusiasm' },
      'Grade School':  { humor: 'high',      complexity: 'low',       entertainment: 'high',    story_intensity: 'curious and fun',   style: 'friendly, curious, encouraging, building excitement' },
      'Mid Grade':     { humor: 'medium',    complexity: 'medium',    entertainment: 'medium',  story_intensity: 'building tension',  style: 'engaging, balanced, occasional jokes, growing confidence' },
      'Junior High':   { humor: 'low',       complexity: 'medium',    entertainment: 'moderate',story_intensity: 'serious with moments', style: 'focused, preparing for big ideas, respectful humor only' },
      'High School':   { humor: 'medium',    complexity: 'high',      entertainment: 'high',    story_intensity: 'climax building',   style: 'smart, witty, story arc peaks here, secret event hints' },
      'University':    { humor: 'minimal',   complexity: 'very high', entertainment: 'low',     story_intensity: 'professional',      style: 'authoritative, trust-building, companion-focused, market structure mastery' },
    };

    const tone = toneProfiles[school_level] || toneProfiles['Grade School'];

    // Build previous context string
    const prevContext = previous_lessons_context && previous_lessons_context.length > 0
      ? `PREVIOUS LESSON SUMMARIES (for continuity — do NOT repeat these topics):\n${previous_lessons_context.map((l, i) => `Lesson ${i + 1}: "${l.title}" — Key takeaway: ${l.key_takeaway}`).join('\n')}`
      : 'This is the first lesson in this course.';

    // Build storyline instruction
    const storylineInstruction = storyline_active
      ? `STORYLINE THREAD ACTIVE — Chapter ${storyline_chapter || 1}: Weave a subtle ongoing narrative thread naturally into the lesson. At ${school_level === 'High School' ? 'HIGH SCHOOL level, escalate the mystery — the secret event is approaching' : school_level === 'University' ? 'UNIVERSITY level, the story has concluded with graduation. Focus is now on mastery.' : 'this level, plant a subtle hint or curious moment'}.`
      : 'No active storyline thread for this lesson.';

    const prompt = `You are an expert educational content creator for IINT Academy — a trading and finance education platform with animated characters.

CHARACTER TEACHING THIS LESSON:
- Name: ${character_name}
- Archetype: ${character_archetype}
- Teaching traits: ${JSON.stringify(character_traits || {})}
- Signature line (their voice): "${character_signature_line || ''}"
- This character ALWAYS maintains their core personality. The school level only slightly adjusts their DELIVERY, not their identity.

LESSON DETAILS:
- Title: "${lesson_title}"
- Category: ${category}
- Sub-category: ${sub_category || 'General'}
- School Level: ${school_level}
- Tone Profile: ${tone.style}
- Humor level: ${tone.humor} | Complexity: ${tone.complexity} | Entertainment: ${tone.entertainment}
${tone_override ? `- TONE OVERRIDE from admin: ${tone_override}` : ''}

${prevContext}

${storylineInstruction}

IMPORTANT RULES:
- Generate ORIGINAL educational content. Never copy or reference external copyrighted material.
- Content must be factually accurate for trading/finance education.
- Each line of dialogue should feel like it comes naturally from THIS character's voice.
- Visual prompts should be imaginative and specific — things a concept art team could illustrate.
- The key_takeaway should be memorable, quotable, and collectible.
- Generate 2-4 quiz questions appropriate for the school level.

OUTPUT FORMAT — return valid JSON matching this exact structure:
{
  "title": "string",
  "key_takeaway": "string (the collectible lesson note — memorable and quotable)",
  "summary": "string (2-3 sentence summary of what this lesson covers)",
  "dialogue_script": [
    {
      "speaker": "character name or 'Student'",
      "line": "dialogue text",
      "type": "intro|dialogue|transition|concept_visual|echo_correction",
      "visual_prompt": "description of what should be visually shown or animated here"
    }
  ],
  "quiz_questions": [
    {
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "correct_answer": "A|B|C|D",
      "explanation": "string"
    }
  ],
  "mystery_thread_hint": "string or null (subtle storyline breadcrumb if storyline active)",
  "animated_moments": [
    {
      "trigger": "after line index (number)",
      "description": "what the animated character does (e.g. LightbulbGuy lights up excited, Robot shoots nodes)",
      "character": "robot|lightbulb"
    }
  ],
  "concept_art_descriptions": [
    "string — detailed visual scene description for concept art illustration"
  ]
}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: 'claude_sonnet_4_6',
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          key_takeaway: { type: 'string' },
          summary: { type: 'string' },
          dialogue_script: { type: 'array', items: { type: 'object' } },
          quiz_questions: { type: 'array', items: { type: 'object' } },
          mystery_thread_hint: {},
          animated_moments: { type: 'array', items: { type: 'object' } },
          concept_art_descriptions: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    // Optionally save to Lesson entity
    if (save_to_db && course_id) {
      await base44.asServiceRole.entities.Lesson.create({
        title: result.title || lesson_title,
        course_id,
        lesson_number: lesson_number || 1,
        school_level,
        faculty_name: character_name,
        faculty_id: character_name.toLowerCase().replace(/\s+/g, '_'),
        dialogue_script: result.dialogue_script || [],
        key_takeaway: result.key_takeaway || '',
        mystery_thread_trigger: !!result.mystery_thread_hint,
        is_exam: false,
      });
    }

    return Response.json({ success: true, lesson: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});