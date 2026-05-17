import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Entity automation: fires when a ScopeFinding is updated.
 * When status changes to 'fixed' and is_completed = true,
 * automatically creates a new validation Scope for other testers
 * to confirm the fix across different device/browser combinations.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { event, data, old_data } = body;

    // Only act on updates to ScopeFinding
    if (event?.type !== 'update') {
      return Response.json({ skipped: 'not an update event' });
    }

    const finding = data;
    const prev = old_data;

    // Only trigger when status just became 'fixed' AND is_completed just became true
    const justFixed = finding?.status === 'fixed' && prev?.status !== 'fixed';
    const justCompleted = finding?.is_completed === true && prev?.is_completed !== true;

    if (!justFixed && !justCompleted) {
      return Response.json({ skipped: 'status/completion not changed to fixed' });
    }

    // Need both conditions met (either can trigger, check both are true now)
    if (finding?.status !== 'fixed' || !finding?.is_completed) {
      return Response.json({ skipped: 'finding not yet fixed+completed' });
    }

    // Don't create duplicate validation scopes
    const existingScopes = await base44.asServiceRole.entities.Scope.filter({
      auto_seeded_from_finding_id: finding.id,
    });

    if (existingScopes.length > 0) {
      return Response.json({ skipped: 'validation scope already exists for this finding' });
    }

    // Determine which devices/browsers were NOT tested by the original reporter
    // so the validation scope targets fresh coverage
    const originalDevice = finding.device_type;
    const originalBrowser = finding.browser;

    const allDevices = ['mobile_ios', 'mobile_android', 'tablet', 'desktop_windows', 'desktop_mac'];
    const allBrowsers = ['chrome', 'firefox', 'safari', 'edge', 'brave', 'opera'];

    // Prefer devices/browsers different from where the bug was originally found
    const targetDevices = allDevices.filter(d => d !== originalDevice).slice(0, 3);
    const targetBrowsers = allBrowsers.filter(b => b !== originalBrowser).slice(0, 3);

    const validationScope = {
      title: `✅ Validate Fix: ${finding.title}`,
      description: `A bug was reported and marked as fixed. Please verify the fix is working correctly on your device and browser.\n\n**Original Finding:** ${finding.title}\n\n**Original Description:** ${finding.description}\n\n**Steps to Reproduce (original):** ${finding.steps_to_reproduce || 'Not provided'}\n\n**What to test:** Confirm that the issue described above no longer occurs. Report "Passed — No Issues" if the fix works, or a new "Bug" if the problem persists.`,
      acceptance_criteria: 'Submit a "Passed — No Issues" finding if the fix is confirmed. Submit a "Bug" finding if the issue is NOT fixed on your device/browser.',
      status: 'active',
      priority: finding.importance_rating >= 7 ? 'high' : finding.importance_rating >= 4 ? 'medium' : 'low',
      category: 'bug_hunt',
      target_devices: targetDevices.length > 0 ? targetDevices : ['any'],
      target_browsers: targetBrowsers.length > 0 ? targetBrowsers : ['any'],
      auto_seeded_from_finding_id: finding.id,
      created_by_admin: 'system_auto',
      completion_count: 0,
      importance_score: finding.importance_rating || 5,
    };

    await base44.asServiceRole.entities.Scope.create(validationScope);

    return Response.json({
      success: true,
      message: `Validation scope created for finding: ${finding.title}`,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});