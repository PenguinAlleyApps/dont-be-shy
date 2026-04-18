/** Core domain types for Don't Be Shy interviews. */

export interface QuestionMeta {
  id: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  good_answer_signals: string[];
  followup: string | null;
}

export interface JudgeVerdict {
  domain_expertise: number; // 0-5
  english_fluency: number; // 0-5
  cefr_estimate: "A2" | "B1" | "B2" | "C1" | "C2";
  structure: number; // 0-5
  confidence: number; // 0-5
  filler_count: number;
  word_count: number;
  fillers_per_100_words: number;
  strengths: string[];
  gaps: string[];
  one_line_improvement: string;
}

export type CodingLanguage = "python" | "javascript" | "typescript" | "csharp";

export type CodingPhase = "clarify" | "design" | "code" | "test";

export interface TestCase {
  /** Human-readable name shown in the UI ("first letter wraps"). */
  name: string;
  /** stdin payload OR pre-built setup snippet for languages without stdin (e.g. an arg array). */
  input: string;
  /** Expected stdout, trimmed. Compared as exact string after trim. */
  expected: string;
  /** If true, this case is a worked example shown to the candidate; not graded. */
  visible?: boolean;
}

export interface CodingQuestion {
  id: string;
  category: "coding";
  difficulty: "easy" | "medium" | "hard";
  /** Title shown above the prompt — short. */
  title: string;
  /** Markdown-friendly problem statement. */
  prompt: string;
  language: CodingLanguage;
  /** Code shown when the editor opens (function signature + comment). */
  starterCode: string;
  testCases: TestCase[];
  /** Optional one-line nudge surfaced after 2nd failed run. */
  solutionHint?: string;
  /** What the judge expects to hear in the corresponding phase. */
  phaseExpectations?: Partial<Record<CodingPhase, string>>;
}

export type InterviewQuestion = QuestionMeta | CodingQuestion;

export function isCodingQuestion(q: InterviewQuestion | null | undefined): q is CodingQuestion {
  return !!q && (q as CodingQuestion).category === "coding";
}

export interface TestResult {
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
  /** If the run errored before producing output. */
  error?: string;
  durationMs?: number;
}

export interface ExecutionResult {
  language: CodingLanguage;
  results: TestResult[];
  stdout: string;
  stderr: string;
  durationMs: number;
  /** True if the runtime itself failed (compile error, sandbox unreachable). */
  systemError?: string;
}

export interface CodeSnapshot {
  /** ms since session start */
  ts: number;
  code: string;
  /** Optional cursor position [line, col] */
  cursor?: [number, number];
  /** Phase active when the snapshot was captured. */
  phase: CodingPhase;
}

export interface CodeJudgeProbe {
  text: string;
  /** Why the judge surfaced this — for debugging, not shown to user. */
  trigger: string;
}

export interface CodeJudgeObservation {
  dimension: keyof CodeVerdict["scores"];
  note: string;
}

export interface CodeVerdict {
  /** Byteboard-style 5 dimensions, each 0-5 with one-line evidence quote. */
  scores: {
    problem_understanding: { score: number; evidence: string };
    approach_quality: { score: number; evidence: string };
    code_quality: { score: number; evidence: string };
    testing_rigor: { score: number; evidence: string };
    communication: { score: number; evidence: string };
  };
  tests_passed: number;
  tests_total: number;
  /** What candidate said the complexity was (if anything). */
  complexity_stated: string | null;
  /** Judge's read of the actual complexity. */
  complexity_actual: string | null;
  one_line_improvement: string;
  /** Language the verdict was written in (matches candidate's transcript). */
  verdict_language: "en" | "es";
}

export interface TurnRecord {
  idx: number;
  questionMeta: InterviewQuestion;
  interviewerText: string;
  userResponse: string;
  judge: JudgeVerdict | CodeVerdict | { error: string; raw?: string };
  /** Only present for coding turns — full keystroke snapshot stream. */
  codeSnapshots?: CodeSnapshot[];
  finalCode?: string;
  language?: CodingLanguage;
  testResults?: TestResult[];
}

export interface SessionConfig {
  jobTitle: string;
  jobDescription?: string;
  companyName?: string;
  mode: "voice" | "text";
  questionCount: number;
  roleType: RoleType;
}

export type RoleType =
  | "software_engineer"
  | "frontend"
  | "backend"
  | "fullstack"
  | "data_ml"
  | "devops"
  | "product_manager"
  | "ux_designer"
  | "sales"
  | "marketing"
  | "leadership"
  | "custom";

export interface SessionSummary {
  sessionId: string;
  config: SessionConfig;
  turns: number;
  scores: AggregateScores;
  startedAt: string;
  completedAt: string;
}

export interface AggregateScores {
  domain_expertise: number;
  english_fluency: number;
  structure: number;
  confidence: number;
  cefr_mode?: string;
  total_fillers: number;
  total_words: number;
  overall_fillers_per_100_words: number;
  turns_scored: number;
}

export interface RoleTemplate {
  id: RoleType;
  name: string;
  description: string;
  icon: string; // lucide icon name
  categories: string[];
  questions: QuestionMeta[];
  /** Optional bank of coding questions for technical roles. */
  codingQuestions?: CodingQuestion[];
}

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}
