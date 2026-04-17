# Contributing

Thanks for your interest in improving Don't Be Shy.

## Quick start

```bash
git clone https://github.com/PenguinAlleyApps/dont-be-shy.git
cd dont-be-shy
npm install
npm run dev
```

## Workflow

1. **Open an issue first** for anything non-trivial. Helps us avoid duplicate work and align on direction.
2. **Fork the repo**, branch from `main`, name your branch descriptively (`fix/judge-parsing-edge-case`, `feat/spanish-interviewer`).
3. **Make your change** with focused commits. Keep PRs small.
4. **Run checks locally** before opening the PR:
   ```bash
   npx tsc --noEmit
   npm run lint
   npm test
   npm run build
   ```
5. **Open a PR** to `main`. Describe what you changed and why. Link the issue.

## Code style

- TypeScript strict mode is on. No `any` unless justified.
- No `console.log` in committed code (development-only logs guarded by `NODE_ENV` check).
- Component files use `kebab-case.tsx`. Test files: `*.test.ts(x)`.
- Tailwind classes only — no inline `style={{}}` unless necessary.

## Tests

Vitest. Run with `npm test`. Add tests for any non-trivial logic in `src/lib/`.

## License

By contributing you agree your contributions are licensed under AGPL-3.0.

## Code of Conduct

Be kind. Assume good faith. No harassment, no discrimination. Maintainers reserve the right to remove contributors who don't meet that bar.
