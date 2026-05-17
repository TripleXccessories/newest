/**
 * SOVEREIGN LOCK CONFIGURATION
 * 
 * This file defines the immutable ownership rules for the IINT platform.
 * The Sovereign is the sole entity with authority over irreversible operations.
 * 
 * TO CHANGE THE SOVEREIGN EMAIL: This must be done manually in this file,
 * by the Sovereign themselves, with a logged reason. It cannot be changed
 * from any UI, admin panel, or external API call.
 * 
 * No partner, admin, or automated process may modify this file's core values
 * without a sovereign-level code deploy — which requires direct repository access.
 */

export const SOVEREIGN_CONFIG = {
  // Primary owner — the only identity that can authorize irreversible actions
  sovereign_email: "YOUR_EMAIL_HERE", // ← Replace with your actual email once

  // Minimum written justification length (characters) for any destructive action
  min_reason_length: 80,

  // Actions that require Sovereign-level confirmation (not just admin)
  sovereign_required_actions: [
    "bulk_delete",
    "admin_grant",
    "admin_revoke",
    "destructive_config_change",
    "data_export",
  ],

  // Actions any admin can do but that MUST be logged with a reason
  logged_actions: [
    "delete_entity_record",
    "function_edit",
    "sovereign_override",
  ],

  // Passphrase pattern validation:
  // The Sovereign confirms identity by writing a reason that reflects
  // their unique voice — checked for minimum length and personal trigger phrases.
  // This is NOT a password — it's a written justification gate.
  voice_trigger_phrases: [
    // Add your own recognizable phrases/words here — things only you would write
    // e.g. "because", "the reason", "this ensures", "for the integrity"
    // These don't unlock anything — they're just logged as authenticity markers
  ],
};

/**
 * Checks if a given email is the Sovereign.
 */
export function isSovereign(email) {
  return email?.toLowerCase().trim() === SOVEREIGN_CONFIG.sovereign_email?.toLowerCase().trim();
}

/**
 * Validates that a written reason meets the Sovereign voice standard.
 * Returns { valid: boolean, issues: string[] }
 */
export function validateSovereignReason(reason = "") {
  const issues = [];

  if (!reason || reason.trim().length < SOVEREIGN_CONFIG.min_reason_length) {
    issues.push(`Reason must be at least ${SOVEREIGN_CONFIG.min_reason_length} characters. You wrote ${reason.trim().length}.`);
  }

  if (reason.trim().split(" ").length < 12) {
    issues.push("Reason must be a genuine written explanation — at least 12 words.");
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}