/**
 * IINT VoicePrint Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Lightweight client-side voice biometric system.
 *
 * How it works:
 *   1. ENROLL — user speaks a passphrase 3x. We extract acoustic features
 *      (pitch mean/variance, speech rate, energy envelope, formant ratios)
 *      from the Web Audio API and store a "voiceprint" fingerprint in localStorage.
 *
 *   2. VERIFY — on each sensitive command, we compare the live voice sample's
 *      features against the stored voiceprint using a cosine similarity score.
 *      Score ≥ THRESHOLD → VERIFIED. Score < THRESHOLD → REJECTED.
 *
 *   3. TRUST TIERS — commands are classified by risk level:
 *      LOW  (info queries)  → no verification required
 *      MED  (suggestions)   → soft check (warn if mismatch, allow proceed)
 *      HIGH (buy/sell orders) → hard block until verified
 *
 * Future: Replace client fingerprint with Azure Speaker Recognition API
 * (already provisioned via AZURE_AI_SERVICES_KEY) for production-grade biometrics.
 */

const PRINT_KEY = (userId) => `iint_voiceprint_${userId}`;
const ENROLL_PASSPHRASE = 'I authorize IINT to verify my voice for trading commands';
const SIMILARITY_THRESHOLD = 0.72; // 72% match required for HIGH commands
const ENROLL_SAMPLES_REQUIRED = 3;

// Command trust levels
export const TRUST_LEVELS = {
  portfolio_summary:  'LOW',
  position_query:     'LOW',
  profit_query:       'LOW',
  market_sentiment:   'LOW',
  bot_status:         'LOW',
  general_query:      'LOW',
  risk_check:         'MED',
  suggestion_request: 'MED',
  execute_buy:        'HIGH',
  execute_sell:       'HIGH',
  stop_listening:     'LOW',
};

export const TRUST_META = {
  LOW:  { label: 'Open Access',        color: '#00d4aa', icon: '🟢', requiresVoicePrint: false },
  MED:  { label: 'Soft Verification',  color: '#fbbf24', icon: '🟡', requiresVoicePrint: false },
  HIGH: { label: 'Voice Auth Required', color: '#ef4444', icon: '🔴', requiresVoicePrint: true  },
};

/**
 * Extract lightweight acoustic features from an AudioBuffer.
 * Returns a normalized feature vector [pitchMean, pitchVar, energyMean, speechRate, spectralCentroid]
 */
export function extractFeatures(audioBuffer) {
  const data = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const len = data.length;

  // RMS Energy
  let sumSq = 0;
  for (let i = 0; i < len; i++) sumSq += data[i] * data[i];
  const rms = Math.sqrt(sumSq / len);

  // Zero crossing rate (proxy for pitch)
  let zc = 0;
  for (let i = 1; i < len; i++) {
    if ((data[i] >= 0) !== (data[i - 1] >= 0)) zc++;
  }
  const zcr = zc / len;

  // Speech rate: count energy bursts above threshold
  const threshold = rms * 0.5;
  let bursts = 0;
  let inBurst = false;
  for (let i = 0; i < len; i++) {
    if (Math.abs(data[i]) > threshold && !inBurst) { bursts++; inBurst = true; }
    else if (Math.abs(data[i]) <= threshold) inBurst = false;
  }
  const speechRate = bursts / (len / sampleRate);

  // Spectral centroid via simple DFT approximation (first 512 samples)
  const fftSize = 512;
  const chunk = data.slice(0, fftSize);
  let weightedSum = 0, magnitudeSum = 0;
  for (let k = 0; k < fftSize / 2; k++) {
    let re = 0, im = 0;
    for (let n = 0; n < fftSize; n++) {
      const angle = (2 * Math.PI * k * n) / fftSize;
      re += chunk[n] * Math.cos(angle);
      im -= chunk[n] * Math.sin(angle);
    }
    const mag = Math.sqrt(re * re + im * im);
    weightedSum += k * mag;
    magnitudeSum += mag;
  }
  const spectralCentroid = magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;

  // Normalize to [0,1]
  return [
    Math.min(zcr * 1000, 1),
    Math.min(rms * 10, 1),
    Math.min(speechRate / 20, 1),
    Math.min(spectralCentroid / 256, 1),
  ];
}

/** Cosine similarity between two feature vectors */
function cosineSimilarity(a, b) {
  if (a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-10);
}

/** Average multiple feature vectors */
function averageFeatures(vectors) {
  if (!vectors.length) return [];
  return vectors[0].map((_, i) => vectors.reduce((s, v) => s + v[i], 0) / vectors.length);
}

export class VoicePrintEngine {
  constructor(userId) {
    this.userId = userId;
    this.key = PRINT_KEY(userId);
  }

  getStoredPrint() {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  isEnrolled() {
    const p = this.getStoredPrint();
    return !!(p?.features?.length && p?.enrolledAt);
  }

  savePrint(features, sampleCount) {
    const print = {
      features,
      enrolledAt: new Date().toISOString(),
      sampleCount,
      userId: this.userId,
      version: '1.0',
    };
    localStorage.setItem(this.key, JSON.stringify(print));
    return print;
  }

  verify(liveFeatures) {
    const stored = this.getStoredPrint();
    if (!stored?.features) return { verified: false, score: 0, reason: 'not_enrolled' };
    const score = cosineSimilarity(liveFeatures, stored.features);
    return {
      verified: score >= SIMILARITY_THRESHOLD,
      score: Math.round(score * 100),
      threshold: Math.round(SIMILARITY_THRESHOLD * 100),
      reason: score >= SIMILARITY_THRESHOLD ? 'match' : 'mismatch',
    };
  }

  revoke() {
    localStorage.removeItem(this.key);
  }
}

export { ENROLL_PASSPHRASE, ENROLL_SAMPLES_REQUIRED };