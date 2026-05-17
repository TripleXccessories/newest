import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ENDPOINT = Deno.env.get("AZURE_VISION_ENDPOINT");
const KEY = Deno.env.get("AZURE_VISION_KEY");

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { image_url, project_id, iteration_name } = await req.json();

    if (!image_url || !project_id || !iteration_name) {
      return Response.json({ error: 'Missing required fields: image_url, project_id, iteration_name' }, { status: 400 });
    }

    const url = `${ENDPOINT}customvision/v3.0/Prediction/${project_id}/classify/iterations/${iteration_name}/url`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Prediction-Key': KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: image_url }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return Response.json({ error: `Azure API error: ${response.status}`, details: errText }, { status: response.status });
    }

    const data = await response.json();
    return Response.json({ predictions: data.predictions, id: data.id, created: data.created });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});