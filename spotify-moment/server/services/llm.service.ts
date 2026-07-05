import type { SessionConstraints, SessionState } from '../types/session.types.js';

function getOpenAiKey(): string | undefined {
  return process.env.OPENAI_API_KEY;
}

function getGeminiKey(): string | undefined {
  return process.env.GEMINI_API_KEY;
}

export interface LlmAnalysis {
  contextLabel?: string;
  contextConfidence?: number;
  sessionConstraints?: SessionConstraints;
  explanations?: Record<string, string>;
  insightBanner?: string;
  sessionMessage?: string;
}

export async function analyzeSession(
  session: SessionState,
  opts?: { refineText?: string; fatigueEvent?: string }
): Promise<LlmAnalysis> {
  const payload = {
    recentSignals: session.recentSignals,
    timeOfDay: getTimeOfDay(),
    explorationLevel: session.explorationLevel,
    artistPlayCounts: session.artistPlayCounts,
    refineText: opts?.refineText,
    fatigueEvent: opts?.fatigueEvent,
    tracks: session.recommendations.slice(0, 10).map((r) => ({
      id: r.id,
      title: r.title,
      artist: r.artist,
      energy: r.energy,
      isDiscovery: r.isDiscovery,
    })),
  };

  const openAiKey = getOpenAiKey();
  const geminiKey = getGeminiKey();

  if (!openAiKey && !geminiKey) {
    return fallbackAnalysis(session, opts);
  }

  try {
    if (openAiKey) return await callOpenAI(payload, openAiKey);
    if (geminiKey) return await callGemini(payload, geminiKey);
  } catch (e) {
    console.warn('LLM failed, using fallback', e);
  }

  return fallbackAnalysis(session, opts);
}

async function callOpenAI(payload: unknown, apiKey: string): Promise<LlmAnalysis> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(15_000),
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are Spotify Moment session AI. Return JSON only.
Never modify long-term taste. Session scope only.
Keys: contextLabel, contextConfidence (0-100), sessionConstraints (optional),
explanations (object trackId->string), insightBanner (optional), sessionMessage (optional).`,
        },
        { role: 'user', content: JSON.stringify(payload) },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI error: ${res.status}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('OpenAI returned empty content');
  return JSON.parse(content) as LlmAnalysis;
}

async function callGemini(payload: unknown, apiKey: string): Promise<LlmAnalysis> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are Spotify Moment session AI. Return JSON only. Never modify long-term taste. Session scope only.
Keys: contextLabel, contextConfidence, sessionConstraints, explanations, insightBanner, sessionMessage.
Input: ${JSON.stringify(payload)}`,
              },
            ],
          },
        ],
        generationConfig: { responseMimeType: 'application/json' },
      }),
      signal: AbortSignal.timeout(15_000),
    }
  );

  if (!res.ok) {
    throw new Error(`Gemini error: ${res.status}`);
  }

  const data = (await res.json()) as {
    candidates: { content: { parts: { text: string }[] } }[];
  };
  const text = data.candidates[0]?.content?.parts[0]?.text ?? '{}';
  return JSON.parse(text) as LlmAnalysis;
}

export function fallbackAnalysis(
  session: SessionState,
  opts?: { refineText?: string; fatigueEvent?: string }
): LlmAnalysis {
  const explanations: Record<string, string> = {};
  for (const r of session.recommendations) {
    if (r.isSwap) {
      explanations[r.id] = r.reason || 'Similar artist — easing repetition.';
    } else if (r.isDiscovery) {
      explanations[r.id] = 'Discovery pick — testing something adjacent to your vibe.';
    } else if (session.recentSignals.some((s) => s.includes('SKIP') && s.includes('early'))) {
      explanations[r.id] = 'Recommended because you skipped slower tracks this session.';
    } else if (session.recentSignals.some((s) => s.startsWith('LIKE') || s.startsWith('SAVE'))) {
      explanations[r.id] = `Similar to artists you've engaged with this session.`;
    } else {
      explanations[r.id] = 'Fits your current session mood.';
    }
  }

  let sessionConstraints = session.sessionConstraints;
  let sessionMessage: string | undefined;

  if (opts?.refineText) {
    sessionConstraints = {
      ...session.sessionConstraints,
      ...parseRefineKeywords(opts.refineText),
    };
    sessionMessage = 'Applied to this session only.';
  }

  return {
    contextLabel: deriveFallbackLabel(session),
    contextConfidence: session.contextConfidence,
    sessionConstraints,
    explanations,
    insightBanner: opts?.fatigueEvent,
    sessionMessage,
  };
}

function deriveFallbackLabel(session: SessionState): string {
  if (session.sessionEnergy >= 4) return 'High Energy Commute';
  if (session.sessionEnergy <= 2) return `${getTimeBasedLabel()} · Low Key`;
  return getTimeBasedLabel();
}

function getTimeBasedLabel(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 11) return 'Morning Commute';
  if (h >= 11 && h < 17) return 'Afternoon Focus';
  if (h >= 17 && h < 22) return 'Evening Wind-down';
  return 'Late Night';
}

export function parseRefineKeywords(text: string): SessionConstraints {
  const t = text.toLowerCase();
  const c: SessionConstraints = {};
  if (t.includes('upbeat') || t.includes('energy')) c.minEnergy = 4;
  if (t.includes('not edm') || t.includes('no edm')) c.excludeGenres = ['EDM'];
  if (t.includes('less mainstream')) c.lessMainstream = true;
  if (t.includes('female')) c.preferFemaleArtists = true;
  if (t.includes('keep this energy') || t.includes('keep the energy')) {
    c.lockEnergyBand = 4;
  }
  return c;
}

function getTimeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  if (h < 22) return 'evening';
  return 'night';
}
