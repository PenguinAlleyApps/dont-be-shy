/**
 * 4-axis scoring rubric for interview evaluation.
 * Ported from modules/consulting/interview_prep/rubric.md.
 * Generalized: "technical correctness" → "domain expertise" to support all roles.
 */

export const RUBRIC = `## 4-axis scoring (each 0-5)

### 1. Domain expertise
- **5:** Accurate, complete, shows depth (names tradeoffs, alternatives, failure modes)
- **4:** Accurate, minor gaps
- **3:** Mostly correct with 1-2 errors
- **2:** Partially correct
- **1:** Major misconceptions
- **0:** Wrong or non-answer

### 2. English fluency + CEFR estimate (A2/B1/B2/C1/C2)
- **5 (C1-C2):** Natural pacing, rare fillers (<3 per 100 words), precise vocabulary, complex structures
- **4 (B2+):** Clear, minor grammar slips, occasional fillers (3-5 per 100 words)
- **3 (B2):** Understandable, noticeable fillers (5-10 per 100 words), simple structures
- **2 (B1):** Frequent fillers (>10 per 100 words), grammar errors impede clarity
- **1 (A2):** Major comprehension barriers
- **0:** Unintelligible

### 3. Structure
- **5:** Explicit structure ("three parts: X, Y, Z"). STAR in behavioral. Signposted transitions.
- **4:** Implicit but clear structure
- **3:** Adequate structure
- **2:** Meandering
- **1:** No structure
- **0:** Incoherent

### 4. Confidence
- **5:** Steady pacing, decisive. Uses senior-signal phrases ("the tradeoff is...", "I'd measure X to validate...")
- **4:** Mostly confident, minor hedging
- **3:** Some hedging ("maybe", "I think") or reflexive defense
- **2:** Frequent hedging, filler-heavy, or over-qualifying
- **1:** Repeatedly retreats from answers
- **0:** Withdrawn or panicked

## Filler words counted
"um", "uh", "like" (non-comparative), "you know", "basically" (as filler), "so..." (as opener), "actually" (non-contrastive), "literally" (non-literal)

## CEFR anchor descriptions
- **C2:** Native-like. Nuanced, effortless.
- **C1:** Fluent, effective, flexible. Complex topics without strain.
- **B2:** Clear, can sustain regular interaction with native speakers on professional topics.
- **B1:** Main points on familiar topics; hesitation on complex ones.
- **A2:** Basic sentences on routine matters.

## Interview red flags (surface in feedback)
- "It depends" without naming the axes
- Over-claiming experience the candidate can't defend
- Dismissing parts of the role
- No questions at the end
- Bad-mouthing previous employers or clients
- Reflexive defense when challenged

## Interview green flags (reward in feedback)
- Names concrete tradeoffs
- Cites measurable outcomes ("cut X by 40%")
- Acknowledges gaps honestly, pivots to related strength
- Asks clarifying questions before jumping into solution
- Admits mid-answer errors and corrects
- Asks 2-3 strategic closing questions`;

export const JUDGE_OUTPUT_SCHEMA = `{
  "domain_expertise": 0-5,
  "english_fluency": 0-5,
  "cefr_estimate": "A2|B1|B2|C1|C2",
  "structure": 0-5,
  "confidence": 0-5,
  "filler_count": integer,
  "word_count": integer,
  "fillers_per_100_words": float,
  "strengths": ["short phrase 1", "short phrase 2"],
  "gaps": ["short phrase 1", "short phrase 2"],
  "one_line_improvement": "most actionable next step in under 20 words"
}`;
