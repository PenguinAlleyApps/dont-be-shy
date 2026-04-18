/**
 * Pre-built role templates with static question banks.
 * Covers tech + non-tech roles for instant start (no generation latency).
 */

import type { RoleTemplate, QuestionMeta, CodingQuestion } from "@/types/interview";

const softwareEngineerQuestions: QuestionMeta[] = [
  {
    id: "swe-001",
    category: "technical",
    difficulty: "easy",
    question: "Walk me through how you approach debugging a production issue that you've never seen before.",
    good_answer_signals: ["Reproduce first", "Check logs and metrics", "Isolate the change", "Communicate status"],
    followup: "Give me a specific example where this process worked for you.",
  },
  {
    id: "swe-002",
    category: "technical",
    difficulty: "medium",
    question: "Explain the tradeoffs between a monolithic architecture and microservices. When would you choose each?",
    good_answer_signals: ["Operational complexity", "Team boundaries", "Deployment independence", "Network latency", "Data consistency"],
    followup: "What signals would tell you it's time to break apart a monolith?",
  },
  {
    id: "swe-003",
    category: "technical",
    difficulty: "medium",
    question: "How do you design an API that needs to support both real-time and batch processing?",
    good_answer_signals: ["Separate paths for sync vs async", "Message queue for batch", "Webhook or polling for status", "Rate limiting"],
    followup: "How would you handle a scenario where batch processing needs to pause real-time traffic?",
  },
  {
    id: "swe-004",
    category: "technical",
    difficulty: "hard",
    question: "Design a system that needs to handle 10,000 concurrent WebSocket connections with message delivery guarantees.",
    good_answer_signals: ["Connection management", "Message persistence", "Horizontal scaling", "Reconnection handling", "Backpressure"],
    followup: "What happens when a client disconnects and reconnects — how do you handle missed messages?",
  },
  {
    id: "swe-005",
    category: "behavioral",
    difficulty: "medium",
    question: "Tell me about a time you shipped something technically ambitious under a tight deadline. Use STAR format.",
    good_answer_signals: ["Situation framed concisely", "Task = what YOU did", "Action = concrete decisions with tradeoffs", "Result quantified"],
    followup: "What would you do differently if you ran it again?",
  },
  {
    id: "swe-006",
    category: "behavioral",
    difficulty: "medium",
    question: "Describe a time you disagreed with a technical decision made by a senior engineer. How did you handle it?",
    good_answer_signals: ["Respectful framing", "Evidence-based", "Proposed experiment", "Outcome"],
    followup: "What would you do if they overruled you and you believed they were wrong?",
  },
  {
    id: "swe-007",
    category: "scenario",
    difficulty: "hard",
    question: "You inherit a legacy codebase with no tests, no documentation, and a critical bug in production. Walk me through your first 48 hours.",
    good_answer_signals: ["Stabilize first", "Read before writing", "Talk to people", "Add tests around the bug", "Incremental improvement"],
    followup: "How do you decide what NOT to fix right away?",
  },
  {
    id: "swe-008",
    category: "closing",
    difficulty: "easy",
    question: "What questions do you have for me about the role, the team, or the company?",
    good_answer_signals: ["Asks about team dynamics", "Asks about hardest problem", "Asks about growth path", "Asks about tech stack decisions"],
    followup: null,
  },
];

const productManagerQuestions: QuestionMeta[] = [
  {
    id: "pm-001",
    category: "domain",
    difficulty: "medium",
    question: "How do you decide what to build next when you have 20 feature requests and limited engineering capacity?",
    good_answer_signals: ["Framework (RICE, ICE, value/effort)", "Stakeholder alignment", "Data-informed", "Says no explicitly"],
    followup: "Give me an example of a feature you killed and how you communicated that decision.",
  },
  {
    id: "pm-002",
    category: "domain",
    difficulty: "medium",
    question: "Walk me through how you write a product requirements document for a new feature.",
    good_answer_signals: ["Problem statement first", "User stories", "Success metrics defined upfront", "Edge cases", "Non-goals section"],
    followup: "How do you handle requirements that change mid-sprint?",
  },
  {
    id: "pm-003",
    category: "domain",
    difficulty: "hard",
    question: "Your key product metric dropped 15 percent this week. Walk me through your investigation.",
    good_answer_signals: ["Segment the drop", "Check for data issues first", "Release correlation", "External factors", "Hypothesis testing"],
    followup: "At what point do you escalate versus continuing to investigate?",
  },
  {
    id: "pm-004",
    category: "scenario",
    difficulty: "hard",
    question: "Engineering says a feature you committed to stakeholders will take 3x longer than estimated. What do you do?",
    good_answer_signals: ["Understand the new estimate", "Negotiate scope", "Communicate early", "Propose alternatives", "Protect the team"],
    followup: "How do you rebuild stakeholder trust after a missed commitment?",
  },
  {
    id: "pm-005",
    category: "behavioral",
    difficulty: "medium",
    question: "Tell me about a product launch that didn't go as planned. What happened and what did you learn?",
    good_answer_signals: ["Honest ownership", "Root cause", "What was missed in planning", "Process change that resulted"],
    followup: "How did you communicate the failure to leadership?",
  },
  {
    id: "pm-006",
    category: "domain",
    difficulty: "easy",
    question: "How do you measure success for a product after launch?",
    good_answer_signals: ["Leading vs lagging indicators", "North star metric", "Cohort analysis", "User feedback loops"],
    followup: "What do you do when your metrics say the feature is working but qualitative feedback is negative?",
  },
  {
    id: "pm-007",
    category: "behavioral",
    difficulty: "medium",
    question: "Describe a time you had to influence a decision without having authority over the people involved.",
    good_answer_signals: ["Built coalition", "Used data", "Found shared goals", "Patient process"],
    followup: "What do you do when influence fails?",
  },
  {
    id: "pm-008",
    category: "closing",
    difficulty: "easy",
    question: "What questions do you have for me about the product, the team, or how we work?",
    good_answer_signals: ["Asks about product vision", "Asks about eng-PM relationship", "Asks about user research access"],
    followup: null,
  },
];

const salesQuestions: QuestionMeta[] = [
  {
    id: "sales-001",
    category: "domain",
    difficulty: "medium",
    question: "Walk me through your typical sales process from first contact to closed deal.",
    good_answer_signals: ["Clear stages", "Qualification criteria", "Discovery depth", "Proposal customization", "Follow-up cadence"],
    followup: "Where in that process do most deals fall apart for you?",
  },
  {
    id: "sales-002",
    category: "domain",
    difficulty: "medium",
    question: "How do you qualify a prospect? What signals tell you to invest time versus move on?",
    good_answer_signals: ["BANT or MEDDIC framework", "Budget authority", "Timeline urgency", "Decision process understanding"],
    followup: "Tell me about a time you walked away from a deal and it was the right call.",
  },
  {
    id: "sales-003",
    category: "scenario",
    difficulty: "hard",
    question: "A prospect says your price is too high and they have a cheaper competitor. How do you handle it?",
    good_answer_signals: ["Don't discount immediately", "Understand their comparison", "Reframe on value not price", "Ask what success looks like"],
    followup: "When IS it right to offer a discount?",
  },
  {
    id: "sales-004",
    category: "behavioral",
    difficulty: "medium",
    question: "Tell me about your biggest deal. What made it complex and how did you close it?",
    good_answer_signals: ["Multiple stakeholders", "Long cycle", "Creative solution", "Persistence", "Quantified outcome"],
    followup: "What almost killed the deal?",
  },
  {
    id: "sales-005",
    category: "domain",
    difficulty: "easy",
    question: "How do you structure your week to balance prospecting, active deals, and account management?",
    good_answer_signals: ["Time blocking", "CRM discipline", "Prospecting ratio", "Pipeline review cadence"],
    followup: "What happens when a quarter isn't tracking to quota?",
  },
  {
    id: "sales-006",
    category: "behavioral",
    difficulty: "medium",
    question: "Describe a time you lost a deal you expected to win. What happened?",
    good_answer_signals: ["Honest reflection", "Identified the gap", "What changed in approach", "Resilience"],
    followup: "How did you bounce back emotionally and practically?",
  },
  {
    id: "sales-007",
    category: "closing",
    difficulty: "easy",
    question: "What questions do you have about our sales org, territory, or the product you'd be selling?",
    good_answer_signals: ["Asks about quota structure", "Asks about sales enablement", "Asks about top rep traits"],
    followup: null,
  },
];

const uxDesignerQuestions: QuestionMeta[] = [
  {
    id: "ux-001",
    category: "domain",
    difficulty: "medium",
    question: "Walk me through your design process from problem identification to shipped solution.",
    good_answer_signals: ["Research first", "Define before ideate", "Iterate with prototypes", "Test with real users", "Handoff quality"],
    followup: "Where do you spend the most time in that process and why?",
  },
  {
    id: "ux-002",
    category: "domain",
    difficulty: "medium",
    question: "How do you handle a situation where stakeholder feedback conflicts with user research findings?",
    good_answer_signals: ["Present data", "Find the underlying concern", "Propose A/B test", "Advocate for users"],
    followup: "Have you ever been overruled? What did you do?",
  },
  {
    id: "ux-003",
    category: "scenario",
    difficulty: "hard",
    question: "You're redesigning a checkout flow that has a 70 percent drop-off rate. Walk me through your approach.",
    good_answer_signals: ["Analyze where drops happen", "Session recordings", "Competitive audit", "Reduce steps", "Test incrementally"],
    followup: "How do you measure success after the redesign ships?",
  },
  {
    id: "ux-004",
    category: "domain",
    difficulty: "easy",
    question: "What's the difference between usability testing and user research, and when do you use each?",
    good_answer_signals: ["Research = discovery, testing = validation", "Methods for each", "When in the process"],
    followup: "What's your favorite lightweight research method when time is tight?",
  },
  {
    id: "ux-005",
    category: "behavioral",
    difficulty: "medium",
    question: "Tell me about a design you're most proud of. What made it successful?",
    good_answer_signals: ["Clear problem", "Process shown", "Measurable impact", "Team collaboration"],
    followup: "What would you change about it now?",
  },
  {
    id: "ux-006",
    category: "behavioral",
    difficulty: "medium",
    question: "Describe a time you had to ship a design you weren't happy with. Why, and what did you learn?",
    good_answer_signals: ["Constraints acknowledged", "Pragmatic tradeoff", "Plan to iterate", "No blame"],
    followup: "How do you manage design debt over time?",
  },
  {
    id: "ux-007",
    category: "closing",
    difficulty: "easy",
    question: "What questions do you have about our design team, our process, or the product?",
    good_answer_signals: ["Asks about design system", "Asks about eng collaboration", "Asks about research resources"],
    followup: null,
  },
];

/* -------------------------------------------------------------------------- */
/* Backend Engineer (.NET-friendly) — talk + coding for SoftServe-style rounds */
/* -------------------------------------------------------------------------- */

const backendQuestions: QuestionMeta[] = [
  {
    id: "be-001",
    category: "technical",
    difficulty: "medium",
    question: "Walk me through how you'd design a REST API for a multi-tenant SaaS where some endpoints are tenant-scoped and others are global.",
    good_answer_signals: ["Tenant identification (header, subdomain, JWT claim)", "Authorization layer per tenant", "Schema isolation strategy", "Cache key partitioning"],
    followup: "How do you prevent a buggy global endpoint from leaking data across tenants?",
  },
  {
    id: "be-002",
    category: "technical",
    difficulty: "medium",
    question: "Explain how async/await works at the thread-pool level — and a real bug you've debugged caused by misusing it.",
    good_answer_signals: ["Continuations on the SynchronizationContext or thread pool", "Avoid .Result/.Wait deadlocks", "ConfigureAwait(false) in libraries", "Specific bug example"],
    followup: "When does adding async actually slow things down?",
  },
  {
    id: "be-003",
    category: "scenario",
    difficulty: "hard",
    question: "Your service hits a third-party API that becomes flaky 1% of the time. Walk me through making the integration robust without making the system slower for the 99% case.",
    good_answer_signals: ["Retry with exponential backoff + jitter", "Circuit breaker (Polly / Resilience4Net)", "Timeout budget", "Idempotency keys", "Async retry vs sync fast-fail"],
    followup: "How do you decide between retrying inline vs queueing for later retry?",
  },
  {
    id: "be-004",
    category: "behavioral",
    difficulty: "medium",
    question: "Tell me about a production incident you were the responder for. STAR format.",
    good_answer_signals: ["Situation framed", "Concrete diagnosis steps", "Decisions under uncertainty", "Outcome with timing", "Postmortem action"],
    followup: "What changed in the system or the process after that incident?",
  },
  {
    id: "be-005",
    category: "closing",
    difficulty: "easy",
    question: "What do you want to know about our backend stack, on-call rotation, or how we ship code?",
    good_answer_signals: ["Asks about deploy frequency", "Asks about test culture", "Asks about who owns Postgres / observability", "Asks about on-call load"],
    followup: null,
  },
];

const backendCodingQuestions: CodingQuestion[] = [
  {
    id: "be-code-001",
    category: "coding",
    difficulty: "easy",
    title: "FizzBuzz with twist",
    prompt: "Read an integer N from stdin. Print numbers 1..N, one per line. For multiples of 3 print `Fizz`, multiples of 5 print `Buzz`, both print `FizzBuzz`. Then print the COUNT of FizzBuzz lines as the last line.",
    language: "csharp",
    starterCode: `using System;

class Program {
    static void Main() {
        int n = int.Parse(Console.ReadLine());
        // your code here
    }
}`,
    testCases: [
      { name: "N=15", input: "15", expected: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n1" },
      { name: "N=5", input: "5", expected: "1\n2\nFizz\n4\nBuzz\n0" },
    ],
    solutionHint: "Track a counter for FizzBuzz hits separately and print it after the loop.",
    phaseExpectations: {
      clarify: "Is the FizzBuzz count line in addition to the 1..N lines, or replacing the last line?",
      design: "I'll loop 1..N, build each line with conditionals, and increment a fizzbuzz counter when both apply.",
    },
  },
  {
    id: "be-code-002",
    category: "coding",
    difficulty: "medium",
    title: "Word frequency",
    prompt: "Read a single line of text from stdin. Output each unique word (case-insensitive, split on whitespace) and its count, sorted by count DESC then word ASC. Format: `word: count`, one per line.",
    language: "csharp",
    starterCode: `using System;
using System.Linq;
using System.Collections.Generic;

class Program {
    static void Main() {
        string line = Console.ReadLine() ?? "";
        // your code here
    }
}`,
    testCases: [
      { name: "tie sort", input: "the cat and the dog", expected: "the: 2\nand: 1\ncat: 1\ndog: 1" },
      { name: "case insensitive", input: "Cat cat CAT dog", expected: "cat: 3\ndog: 1" },
    ],
    solutionHint: "Use a Dictionary<string,int>, then OrderByDescending(count).ThenBy(word).",
    phaseExpectations: {
      design: "Tokenize, lowercase, count with a dictionary, then sort by (-count, word).",
    },
  },
  {
    id: "be-code-003",
    category: "coding",
    difficulty: "medium",
    title: "Idempotent retry counter",
    prompt: "Implement a function `solve(input)` that takes a list of `request_id` strings (one per line). Return the count of UNIQUE request_ids — the count after deduping. Print the result.",
    language: "python",
    starterCode: `def solve(input):
    """input is a string with one request_id per line. Return an int."""
    # your code here
    return 0
`,
    testCases: [
      { name: "all dupes", input: "\"req-1\\nreq-1\\nreq-1\"", expected: "1" },
      { name: "mixed", input: "\"a\\nb\\na\\nc\\nb\"", expected: "3" },
      { name: "empty", input: "\"\"", expected: "0" },
    ],
    solutionHint: "Split on newline, filter empty strings, wrap in set(), return len().",
    phaseExpectations: {
      clarify: "Should empty lines count as a unique id? (No — filter them.)",
    },
  },
  {
    id: "be-code-004",
    category: "coding",
    difficulty: "hard",
    title: "Rate limiter (token bucket)",
    prompt: "Read two integers from stdin on the first line: `capacity refill_per_sec`. Then read N timestamps (floats, seconds since epoch) — one per line. For each request, print `OK` if it's allowed, `LIMITED` if dropped. Bucket starts full.",
    language: "csharp",
    starterCode: `using System;
using System.Collections.Generic;

class Program {
    static void Main() {
        var first = Console.ReadLine().Split(' ');
        int capacity = int.Parse(first[0]);
        double refill = double.Parse(first[1]);
        // your code here
    }
}`,
    testCases: [
      {
        name: "burst then refill",
        input: "2 1\n1.0\n1.1\n1.2\n2.5\n2.6",
        expected: "OK\nOK\nLIMITED\nOK\nLIMITED",
      },
    ],
    solutionHint: "Track tokens as a double. Before each request, tokens = min(capacity, tokens + (now - lastTime) * refill). If tokens >= 1: consume, OK. Else LIMITED.",
    phaseExpectations: {
      design: "Token bucket: maintain `tokens` and `lastTime`. On each request, refill since lastTime, then try to consume one.",
      test: "Edge: first request always OK because bucket starts full.",
    },
  },
];

/* -------------------------------------------------------------------------- */
/* Coding additions for software_engineer                                     */
/* -------------------------------------------------------------------------- */

const softwareEngineerCodingQuestions: CodingQuestion[] = [
  {
    id: "swe-code-001",
    category: "coding",
    difficulty: "easy",
    title: "Two sum",
    prompt: "Given an array of integers and a target, return the indices of the two numbers that add up to target. Read input as JSON: `{\"nums\": [...], \"target\": N}`. Return `[i, j]` with i < j.",
    language: "python",
    starterCode: `def solve(input):
    """input is a dict {'nums': [...], 'target': N}. Return [i, j] with i < j."""
    nums = input["nums"]
    target = input["target"]
    # your code here
    return []
`,
    testCases: [
      { name: "basic", input: "{\"nums\": [2, 7, 11, 15], \"target\": 9}", expected: "[0, 1]" },
      { name: "later pair", input: "{\"nums\": [3, 2, 4], \"target\": 6}", expected: "[1, 2]" },
      { name: "negatives", input: "{\"nums\": [-1, -2, -3, -4, -5], \"target\": -8}", expected: "[2, 4]" },
    ],
    solutionHint: "Hash map of value→index lets you do it in O(n).",
    phaseExpectations: {
      design: "I'll use a hash map: as I scan, check if (target - num) is already seen.",
    },
  },
  {
    id: "swe-code-002",
    category: "coding",
    difficulty: "medium",
    title: "Anagram groups",
    prompt: "Given an array of strings, group anagrams together. Read JSON `{\"words\": [...]}`. Return `[[group1...], [group2...]]` — each group sorted alphabetically, groups sorted by their first element.",
    language: "javascript",
    starterCode: `function solve(input) {
  const words = input.words;
  // your code here
  return [];
}
`,
    testCases: [
      {
        name: "basic",
        input: "{\"words\": [\"eat\", \"tea\", \"tan\", \"ate\", \"nat\", \"bat\"]}",
        expected: "[[\"ate\",\"eat\",\"tea\"],[\"bat\"],[\"nat\",\"tan\"]]",
      },
      { name: "single", input: "{\"words\": [\"abc\"]}", expected: "[[\"abc\"]]" },
    ],
    solutionHint: "Key each word by its sorted-letters string. Map → groups → sort.",
  },
  {
    id: "swe-code-003",
    category: "coding",
    difficulty: "medium",
    title: "Merge intervals",
    prompt: "Given an array of intervals `[[start, end], ...]` (already in input as JSON `{\"intervals\": [...]}`), merge any overlapping intervals and return the result sorted by start.",
    language: "typescript",
    starterCode: `function solve(input: { intervals: number[][] }): number[][] {
  const intervals = input.intervals;
  // your code here
  return [];
}
`,
    testCases: [
      {
        name: "overlapping",
        input: "{\"intervals\": [[1,3],[2,6],[8,10],[15,18]]}",
        expected: "[[1,6],[8,10],[15,18]]",
      },
      {
        name: "touching",
        input: "{\"intervals\": [[1,4],[4,5]]}",
        expected: "[[1,5]]",
      },
    ],
    solutionHint: "Sort by start. Walk through; if current.start <= last.end, merge by extending last.end = max(last.end, current.end).",
    phaseExpectations: {
      design: "Sort by start. Linear scan merging when overlap. O(n log n).",
    },
  },
  {
    id: "swe-code-004",
    category: "coding",
    difficulty: "hard",
    title: "LRU cache size check",
    prompt: "Implement a simple capacity tracker. Read input `{\"capacity\": K, \"ops\": [[\"put\", key, val] | [\"get\", key]]}`. After all ops, print the current set of keys in MRU→LRU order, comma-separated.",
    language: "javascript",
    starterCode: `function solve(input) {
  const { capacity, ops } = input;
  // your code here
  // print MRU→LRU keys joined by ","
}
`,
    testCases: [
      {
        name: "basic eviction",
        input: "{\"capacity\": 2, \"ops\": [[\"put\",1,1],[\"put\",2,2],[\"get\",1],[\"put\",3,3]]}",
        expected: "1,3",
      },
      {
        name: "no eviction",
        input: "{\"capacity\": 3, \"ops\": [[\"put\",\"a\",1],[\"put\",\"b\",2],[\"get\",\"a\"]]}",
        expected: "a,b",
      },
    ],
    solutionHint: "Use a Map (preserves insertion order). On get/put, delete then re-set the key to bump it to most-recent.",
    phaseExpectations: {
      design: "Map keeps insertion order. Re-inserting a key moves it to the end (most recent). Reverse the keys at the end for MRU first.",
    },
  },
];

export const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    id: "software_engineer",
    name: "Software Engineer",
    description: "General software engineering — architecture, coding, debugging, system design",
    icon: "Code2",
    categories: ["technical", "behavioral", "scenario", "closing", "coding"],
    questions: softwareEngineerQuestions,
    codingQuestions: softwareEngineerCodingQuestions,
  },
  {
    id: "backend",
    name: "Backend Engineer",
    description: "APIs, databases, distributed systems. Coding tracks support C# and Python.",
    icon: "Server",
    categories: ["technical", "behavioral", "scenario", "closing", "coding"],
    questions: backendQuestions,
    codingQuestions: backendCodingQuestions,
  },
  {
    id: "product_manager",
    name: "Product Manager",
    description: "Product strategy, prioritization, stakeholder management, metrics",
    icon: "LayoutDashboard",
    categories: ["domain", "behavioral", "scenario", "closing"],
    questions: productManagerQuestions,
  },
  {
    id: "sales",
    name: "Sales / Business Development",
    description: "Pipeline management, qualification, negotiation, closing deals",
    icon: "Handshake",
    categories: ["domain", "behavioral", "scenario", "closing"],
    questions: salesQuestions,
  },
  {
    id: "ux_designer",
    name: "UX Designer",
    description: "User research, design process, prototyping, usability testing",
    icon: "Palette",
    categories: ["domain", "behavioral", "scenario", "closing"],
    questions: uxDesignerQuestions,
  },
  {
    id: "custom",
    name: "Custom Role",
    description: "Paste a job description and we'll generate personalized questions",
    icon: "Sparkles",
    categories: [],
    questions: [],
  },
];
