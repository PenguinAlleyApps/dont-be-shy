/** Don't Be Shy configuration — environment variables and constants. */

export const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";

export const DEFAULT_INTERVIEWER_MODEL = "claude-sonnet-4-20250514";
export const DEFAULT_JUDGE_MODEL = "claude-sonnet-4-20250514";

/** Demo mode limits */
export const DEMO_MAX_QUESTIONS = 3;
export const DEMO_RATE_LIMIT_PER_HOUR = 5;

/** App metadata */
export const APP_VERSION = "0.1.0";
export const APP_NAME = "Don't Be Shy";
