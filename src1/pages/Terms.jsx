import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, ChevronDown, ChevronUp } from 'lucide-react';
import IINTLogo from '@/components/layout/IINTLogo';
import { Link } from 'react-router-dom';

const SECTIONS = [
  {
    title: '1. Company Information',
    content: `These Terms and Conditions ("Terms") govern your access to and use of the IINT Platform ("Platform"), operated by IINT Inc. ("Company", "we", "us", or "our"), a corporation duly incorporated under the laws of Canada.

Registered Name: IINT Inc.
Platform: Invest in Neural Trading (IINT)
Website: www.investinneuraltrading.com
Contact: admin@iint.com

By accessing or using the Platform, you agree to be bound by these Terms. If you do not agree to these Terms, do not use the Platform.`
  },
  {
    title: '2. Eligibility & Beta Access',
    content: `The Platform is currently operating in Beta. Access is granted on an invitation or application basis.

You must be at least 18 years of age to register and use the Platform. By registering, you represent and warrant that you meet this requirement.

Beta users acknowledge that:
- The Platform is provided "as is" during the beta period
- Features, pricing, and functionality may change without notice
- Beta access does not guarantee access to the final commercial platform
- IINT Inc. reserves the right to terminate beta access at any time

Beta testers who complete the High School level of the IINT Academy may be eligible for a lifetime discount on paid subscription tiers, subject to verification and availability at the time of commercial launch.`
  },
  {
    title: '3. Platform Description',
    content: `The IINT Platform is an educational and analytical trading simulation tool. It provides:

- AI-generated trading signals and analysis
- Paper (virtual) trading simulation with no real money involved
- Educational content through the IINT Academy curriculum
- AI-powered bot rental for simulated trading strategies
- Community features including leaderboards and strategy sharing
- Trade journaling, risk analysis, and performance analytics

IMPORTANT: The Platform does not provide licensed financial advice, investment advice, brokerage services, or any regulated financial service. All signals, strategies, and outputs are for educational and entertainment purposes only. No actual financial transactions occur on the Platform during the beta period.`
  },
  {
    title: '4. Not Financial Advice',
    content: `THE IINT PLATFORM IS NOT A REGISTERED INVESTMENT ADVISOR, BROKER-DEALER, OR FINANCIAL INSTITUTION. NOTHING ON THE PLATFORM CONSTITUTES FINANCIAL, INVESTMENT, LEGAL, OR TAX ADVICE.

All information, signals, strategies, AI outputs, and educational content provided on the Platform are for informational and educational purposes only. You should consult a qualified financial advisor before making any investment decisions.

Past simulated performance is not indicative of future real-world results. All trading involves risk. Virtual results on the Platform do not represent real financial outcomes.

By using the Platform, you acknowledge that:
- You are solely responsible for your own investment decisions
- IINT Inc. bears no liability for any real financial losses you may incur
- You are using the Platform for educational purposes only`
  },
  {
    title: '5. User Accounts & Security',
    content: `When you create an account, you agree to:

- Provide accurate, current, and complete information
- Maintain the security of your password and account
- Notify us immediately of any unauthorized access at admin@iint.com
- Accept responsibility for all activity under your account

IINT Inc. reserves the right to suspend or terminate accounts that violate these Terms, engage in fraudulent activity, or pose a security risk to the Platform or its users.`
  },
  {
    title: '6. Community Standards & Zero-Tolerance Policy',
    content: `The IINT Platform maintains a strict community standards policy. All users agree to conduct themselves respectfully and professionally.

STRICTLY PROHIBITED:
- Racist, discriminatory, or hate-based language or content of any kind
- Harassment, bullying, or targeted abuse of other users
- Sexually explicit or graphic content
- Threats of violence or harm
- Impersonation of other users, IINT staff, or public figures
- Sharing of private personal information of others (doxxing)

ENFORCEMENT PROTOCOL:
Strike 1 (Profanity / Minor Violations): Warning issued by the platform moderation system.
Strike 2 (Racism / Discrimination - First Offense): Formal warning and 6-week suspension.
Strike 3 (Racism / Discrimination - Second Offense): 6-month suspension.
Strike 4 (Racism / Discrimination - Third Offense / Severe): Permanent ban. All virtual account assets are transferred to the IINT Community Trust Fund as per these Terms.

PERMANENT BAN NOTE: Permanently banned users forfeit all virtual assets, achievements, and rewards accumulated on the Platform. Future registration using the same email address will be automatically rejected. IINT Inc. reserves the right to pursue legal action in cases of extreme violations.

By agreeing to these Terms, you explicitly acknowledge and consent to this enforcement policy.`
  },
  {
    title: '7. Intellectual Property',
    content: `All content on the IINT Platform, including but not limited to the AI systems, trading algorithms, Academy curriculum, faculty characters, bot personas, visual assets, branding, and platform architecture, is the exclusive intellectual property of IINT Inc.

The core infrastructure features of the Platform, including proprietary neural trading signal systems and AI-powered bot architecture, are the subject of pending patent applications filed by IINT Inc. Unauthorized reproduction, reverse engineering, or commercial use of these systems is strictly prohibited.

You may not:
- Copy, reproduce, or distribute any Platform content without written consent
- Reverse engineer, decompile, or attempt to extract source code
- Use Platform content for competitive commercial purposes
- Claim ownership of any Platform-generated content

IINT Inc. grants you a limited, non-exclusive, non-transferable license to access and use the Platform for personal, non-commercial purposes in accordance with these Terms.`
  },
  {
    title: '8. Subscription Tiers, Pricing & Refunds',
    content: `The Platform is currently free to access during the beta period. Commercial subscription tiers will be introduced upon full launch.

SUBSCRIPTION TIERS & COMPANION/RENTAL ALLOWANCES:
The IINT Platform offers tiered subscription packages. The following describes the companion and rental allowances per tier. "Included" means bundled in the tier price. "Allowed" means the maximum number of bot rentals permitted (rentals are priced separately and are NOT included in tier pricing).

Tier 1 — Retail:
- Companions Included: 0 (none bundled)
- Bot Rentals Allowed: Up to 5 (priced separately)

Tier 2 — Pro:
- Companions Included: 2 selectable companions
- Bot Rentals Allowed: Up to 5 (additional, priced separately)

Tier 3 — Creator:
- Companions Included: 3 selectable companions
- Bot Rentals Allowed: Up to 10 (priced separately)
- Save & Export privileges for custom companions (requires save credits)

Tier 4 — Institutional:
- Companions Included: 4 selectable companions
- Bot Rentals Allowed: Up to 15 (priced separately)

Tier 5 — Ultimate (Institutional):
- Companions Included: 5 selectable companions
- 14 additional open companion slots available
- Headmaster faculty access included (19 total faculty accessible)
- Bot Rentals Allowed: Up to 19 (priced separately)

IMPORTANT: Bot rentals are never included in tier pricing. "Allowed" rental counts indicate the maximum number of simultaneous rentals permitted at that tier. Rental pricing is displayed separately in the platform store.

COMPANION SAVE PACKS (Pay-As-You-Go):
Saving and exporting custom-built companions requires save credits, available as pay-as-you-go packs:

- 5 Saves + 1 Slot: $4.99 USD
- 15 Saves + 1 Slot: $12.99 USD
- 30 Saves + 1 Bonus Slot: $24.99 USD (Best Value)

SAVE CREDIT RULES:
- Every save action — including minor edits — consumes 1 save credit.
- Each character slot holds one saved companion (card frame + background scene + character image + voice + mood + personality traits).
- Maximum of 20 companion slots may be owned at any time.
- If all slots are occupied, the user will be prompted to override an existing slot or purchase additional slots (if under the 20-slot maximum).
- Save packs and companion slots are non-refundable once purchased.

IINT FACULTY SLOT PROTECTION:
Companion save slots and credits apply exclusively to user-created custom companions. IINT Inc.'s 18 core faculty characters and the Headmaster are permanent intellectual property of IINT Inc. and are NOT subject to user save slots. User save actions do not override, replace, or interfere with any IINT-owned faculty characters.

COMPANION STORE UNLOCK:
The Companion Creator, pricing information, and save pack purchasing options become visible only after a user completes the University level curriculum and their first interactive free companion build. Prior to this unlock, the store section is displayed in a restricted preview state.

SUBSCRIPTION BILLING:
- Subscription fees will be charged in USD as specified on the pricing page
- Subscriptions auto-renew unless cancelled prior to the renewal date
- Annual plans receive a discount as advertised at time of purchase
- Beta testers who qualify for lifetime discounts will have those applied at checkout

REFUND POLICY: Due to the digital nature of the Platform and the AI credits consumed, all subscription purchases and companion save pack purchases are non-refundable. Exceptions may be made at the sole discretion of IINT Inc. for technical errors or billing issues. Contact admin@iint.com within 7 days of a charge to request review.

IINT Inc. reserves the right to change pricing at any time with 30 days' notice to active subscribers.`
  },
  {
    title: '9. Limitation of Liability',
    content: `TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IINT INC. AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR:

- Any indirect, incidental, special, consequential, or punitive damages
- Loss of profits, data, goodwill, or other intangible losses
- Any real financial losses incurred as a result of acting on Platform content
- Platform downtime, data loss, or service interruptions
- Actions taken by third-party integrations or APIs

IN NO EVENT SHALL IINT INC.'S TOTAL LIABILITY TO YOU EXCEED THE AMOUNT YOU HAVE PAID TO IINT INC. IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR $100 CAD, WHICHEVER IS GREATER.

Some jurisdictions do not allow the exclusion of certain warranties or the limitation of liability. In such jurisdictions, IINT Inc.'s liability is limited to the greatest extent permitted by law.`
  },
  {
    title: '10. Privacy & Data',
    content: `IINT Inc. collects and processes personal data in accordance with applicable Canadian privacy law, including the Personal Information Protection and Electronic Documents Act (PIPEDA).

We collect:
- Account registration information (name, email)
- Platform usage data and trading activity
- Content submitted through community features
- Technical data (device, browser, IP address)

We use your data to:
- Operate and improve the Platform
- Personalize your experience
- Send service and promotional communications (with consent)
- Comply with legal obligations

We do not sell your personal data to third parties. We may share data with service providers necessary to operate the Platform, subject to confidentiality agreements.

You may request access to, correction of, or deletion of your personal data by contacting admin@iint.com.`
  },
  {
    title: '11. Governing Law & Dispute Resolution',
    content: `These Terms shall be governed by and construed in accordance with the laws of Canada, without regard to its conflict of law principles.

Any dispute arising from or relating to these Terms or the Platform shall first be submitted to good-faith mediation. If mediation fails, disputes shall be resolved through binding arbitration in accordance with Canadian arbitration rules.

Class action lawsuits and class-wide arbitrations are waived to the extent permitted by law.

You agree that any legal proceedings will be conducted in English and in Canada.`
  },
  {
    title: '12. Changes to Terms',
    content: `IINT Inc. reserves the right to modify these Terms at any time. We will notify users of material changes via:
- Email notification to your registered address
- A notice displayed within the Platform

Your continued use of the Platform after changes take effect constitutes acceptance of the revised Terms. If you do not agree to the updated Terms, you must discontinue use of the Platform.

These Terms were last updated: May 2026.`
  },
  {
    title: '13. Inactive Accounts & Deceased User Policy',
    content: `IINT Inc. recognizes that life circumstances may prevent users from accessing their accounts. This section governs how inactive and deceased user accounts are handled.

INACTIVE ACCOUNTS:
Accounts with no verified login activity for twelve (12) consecutive months will receive a reactivation notice sent to the registered email address and, where provided, the emergency contact on file. If no response is received within 60 days of notice, the account will be placed in a preservation state pending further review.

DECEASED USER NOTIFICATION:
IINT Inc. relies on notification from a designated emergency contact or Benevolent Benefactor to confirm a user's passing. Upon receiving such notification, IINT Inc. will:

1. Immediately freeze all account activity and holdings.
2. Send a structured verification request to the reporting contact to confirm circumstances. The contact will be asked to indicate whether the user is:
   — Terminally ill (limited time remaining)
   — Temporarily unavailable (detained, hospitalized, or without device access)
   — Permanently deceased or in an unrecoverable state

3. Upon any confirmed response, the ARM Kill Switch is activated and a percentage summary of preserved equity (expressed as a percentage only — no currency value will be disclosed) will be communicated to the reporting contact.

4. The contact will be directed to admin@iint.com with all correspondence, proof of passing, and identity documentation to begin the formal claims process.

VERIFICATION & GRACE PERIODS:
- A 12-month trust hold begins from the date of IINT's first written confirmation of a reported passing.
- During this period, a legally witnessed will or estate document specifically naming this platform shall take precedence over any internal designation on file.
- A 4-month sub-window within the grace period is provided for any existing estate to be updated to specifically include this platform, where such update was not made prior to the user's passing.
- After the full 12-month period with no verified legal claim produced, holdings transfer per the Benevolent Benefactor designation on file.

PRIORITY ORDER OF CLAIMS:
1. A legally witnessed and executed will or estate document that specifically names IINT Inc. or the user's account herein.
2. The Benevolent Benefactor named on the user's in-platform designation form (Settings → Benefactor).
3. The Emergency Contact on file, if no separate Benefactor was designated, under the same guidelines as a named Benefactor.
4. If no benefactor or emergency contact is designated: IINT Inc. becomes the sole trustee of remaining funds.

IINT INC. AS TRUSTEE:
Where IINT Inc. assumes trusteeship of residual funds, we commit to acting in good faith. Funds may be used for:
- A charitable donation made in the user's name, guided by any interests, causes, or admiration evident in their platform activity and profile.
- Platform development and advancement of technology, in recognition of the user's contribution as a beta participant.

These decisions are made respectfully, with consideration of the user's history, character, and contribution to the platform community.

TIMESTAMP & OVERRIDE POLICY:
All changes made to the Benefactor designation form are timestamped and logged. The most recently confirmed designation overrides any previous version. Unlisted estate claims where this platform is not specifically named in a will or legal document will not supersede a confirmed, timestamped in-platform designation.

By continuing to use the IINT Platform, you acknowledge and agree to this policy in full. Continued use constitutes the same binding agreement as a signed document.`
  },
  {
    title: '14. Benevolent Benefactor Agreement',
    content: `Users may designate a Benevolent Benefactor via the Settings page of the IINT Platform. This designation is governed by the following:

DESIGNATION:
- The designated Benevolent Benefactor must be a person of legal age in their jurisdiction.
- The user confirms that the person listed has been informed of this designation, or consents to IINT Inc. contacting them in the described circumstances.
- This designation can be updated at any time. All changes are timestamped.

EMERGENCY CONTACT AS DEFAULT BENEFACTOR:
If a Benevolent Benefactor is not separately designated but an Emergency Contact is on file, the Emergency Contact assumes the role of Benevolent Benefactor under the same guidelines described in §13 of these Terms.

SKIPPED DESIGNATION:
Users who choose to skip the Benevolent Benefactor form at onboarding or at any time acknowledge that:
- Any funds remaining in their account at time of confirmed account closure due to death will be held in trust for the grace periods described in §13.
- If no legal estate document is produced within the prescribed period naming this platform, and no benefactor or emergency contact is on file, all holdings transfer to IINT Inc. as described in §13.

CLAIMS PROCESS:
All benefactor claims require:
1. Written notification to admin@iint.com
2. A certified copy of the death certificate
3. Government-issued photo ID of the claimant
4. Proof of relationship to the deceased (where applicable)
5. Any estate or will document referencing the platform (if applicable)

IINT Inc. reserves the right to request additional documentation and to involve legal counsel during the verification process. No funds will be released until the verification process is complete to IINT Inc.'s satisfaction.

By completing the Benefactor Designation form in Settings, you agree to this section as a binding supplement to these Terms and Conditions.`
  },
];

function Section({ section }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[#1e293b] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#1e293b]/40 transition-colors"
      >
        <span className="text-sm font-semibold text-[#f1f5f9]">{section.title}</span>
        {open ? <ChevronUp size={16} className="text-[#64748b]" /> : <ChevronDown size={16} className="text-[#64748b]" />}
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="px-5 pb-5 text-xs text-[#94a3b8] leading-relaxed whitespace-pre-line border-t border-[#1e293b] pt-4"
        >
          {section.content}
        </motion.div>
      )}
    </div>
  );
}

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#070b14] text-[#f1f5f9]">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <IINTLogo size="md" />
          <div className="mt-6 flex items-center gap-2">
            <Shield size={20} className="text-[#00d4aa]" />
            <h1 className="text-2xl font-bold">Terms & Conditions</h1>
          </div>
          <p className="text-sm text-[#64748b] mt-2 max-w-lg">
            Please read these terms carefully. By using the IINT Platform, you agree to be bound by these Terms and Conditions.
          </p>
          <div className="mt-3 px-3 py-1.5 bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-full text-xs text-[#f59e0b] font-medium">
            IINT Inc. — Beta Platform · Last Updated May 2026
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-3">
          {SECTIONS.map((s) => (
            <Section key={s.title} section={s} />
          ))}
        </div>

        {/* Footer nav */}
        <div className="mt-10 pt-8 border-t border-[#1e293b] flex items-center justify-between text-xs text-[#475569]">
          <p>© 2026 IINT Inc. All rights reserved.</p>
          <Link to="/" className="text-[#00d4aa] hover:underline">← Back to Platform</Link>
        </div>
      </div>
    </div>
  );
}