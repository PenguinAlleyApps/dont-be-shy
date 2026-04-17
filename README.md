# Don't Be Shy — Interview Simulation

> **Practice any interview. Get scored in real time.**
> A free, open-source mock interview simulator. AI interviewer adapts to your answers, scores you on a 4-axis rubric (domain, English fluency + CEFR, structure, confidence), and gives per-turn feedback.

**A product by [Penguin Alley](https://penguinalley.com).**

---

## Why this exists

Mock interviews with humans cost $50-100 a session and you have to schedule them. Most candidates skip the practice and walk into the real thing cold. Don't Be Shy gives you unlimited reps with instant, structured feedback — voice or text, any role, any stack.

## Features

- **Any role** — pick a template (software engineer, PM, designer, sales, marketing, leadership) or paste a full job description for personalized questions
- **4-axis scoring** — domain expertise, English fluency (with CEFR estimate A2-C2), structure, confidence
- **Voice mode** — speak your answers, the interviewer speaks back. Browser-native (Chrome/Edge), zero server cost, no signup
- **Text mode** — fully accessible fallback for any browser
- **Per-turn feedback** — strengths, gaps, one-line improvement after each answer
- **Streaming responses** — interviewer text appears in real time
- **Bring your own key (BYOK)** — your Anthropic API key stays in your browser, never sent to our servers
- **Demo mode** — try 3 questions free without a key

## Live demo

Coming soon — deploy to Vercel from this repo or run locally.

## Quick start

```bash
git clone https://github.com/PenguinAlleyApps/dont-be-shy.git
cd dont-be-shy
npm install
cp .env.example .env.local   # optional: only needed for demo-mode key
npm run dev
```

Open <http://localhost:3000>. Enter your [Anthropic API key](https://console.anthropic.com/settings/keys), pick a role, and start practicing.

## How it works

1. **Choose a role** — template or job description
2. **The interviewer** (Claude Sonnet 4) generates a custom persona and question bank for that role
3. **Answer one question at a time** — voice or text
4. **The judge** (Claude Sonnet 4) scores each answer on the 4-axis rubric and returns JSON with strengths, gaps, and a next step
5. **Aggregate report** — per-session scores, CEFR mode, filler count, downloadable transcript

## BYOK vs demo mode

| Mode | Setup | Limits | Best for |
|------|-------|--------|----------|
| **BYOK** | You provide an Anthropic key in the UI | None — pay-as-you-go to Anthropic | Real practice |
| **Demo** | Server-side key (env var) | 3 questions, 5 sessions/hour | Trying it out |

Your BYOK key is stored in `localStorage`. It is sent only to Anthropic, never to our backend, never logged.

## Tech stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4
- **AI:** Claude Sonnet 4 via `@anthropic-ai/sdk`
- **Voice:** Web Speech API (browser-native STT + TTS)
- **State:** sessionStorage (per browser tab)
- **Testing:** Vitest
- **Deploy:** Vercel (zero-config)

## Browser support

Voice mode requires Web Speech API:

| Browser | Voice mode | Text mode |
|---------|------------|-----------|
| Chrome / Edge | ✅ | ✅ |
| Safari | ⚠️ partial | ✅ |
| Firefox | ❌ no STT | ✅ |

If voice isn't available, text mode works everywhere.

## Roadmap

- [ ] Persistent session history (Supabase)
- [ ] Premium persona pack (FAANG interviewers, leadership ladder)
- [ ] Coaching analytics — multi-session trend lines, weakness detection
- [ ] Multi-language interviews (Spanish, French, German)
- [ ] Hosted Pro tier (no BYOK required)
- [ ] Team accounts for HR/coaches

## Contributing

Bug reports and feature requests via [GitHub Issues](https://github.com/PenguinAlleyApps/dont-be-shy/issues). Pull requests welcome — please open an issue first to discuss non-trivial changes.

## License

[AGPL-3.0](LICENSE). You are free to use, modify, and self-host. If you offer Don't Be Shy as a network service, you must publish your modifications under the same license.

## Credits

Built by [PA·co](https://penguinalley.com), the multi-agent operating system of Penguin Alley.

Inspired by the lack of accessible interview prep tooling for engineers transitioning into AI roles.

---

**Free. Open source. Bring your own key.**
