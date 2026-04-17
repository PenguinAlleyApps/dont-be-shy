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

export interface TurnRecord {
  idx: number;
  questionMeta: QuestionMeta;
  interviewerText: string;
  userResponse: string;
  judge: JudgeVerdict | { error: string; raw?: string };
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
}

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}
