import { Snowflake, Mic, BarChart3, Globe, Github } from "lucide-react";
import { NavHeader } from "@/components/layout/nav-header";
import { AttributionFooter } from "@/components/layout/attribution-footer";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-indigo-50 to-white px-4 pb-16 pt-20 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 flex justify-center">
              <div className="rounded-2xl bg-indigo-600 p-4 shadow-lg shadow-indigo-200">
                <Snowflake className="h-10 w-10 text-white" />
              </div>
            </div>

            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-600">
              Interview Simulation · A product by Penguin Alley
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Don&rsquo;t Be Shy.
              <br />
              <span className="text-indigo-600">Practice any interview, scored in real time.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg text-slate-600">
              AI interviewer adapts to your answers. 4-axis scoring with CEFR
              English fluency estimation. Voice or text. Any role. Free and open
              source.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="/setup"
                aria-label="Start a free interview session"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Try it now — free
              </a>
              <a
                href="https://github.com/PenguinAlleyApps/dont-be-shy"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View the source code on GitHub"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-6 py-3 text-base font-semibold text-slate-700 transition-all hover:border-indigo-300 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <Github aria-hidden="true" className="h-5 w-5" />
                View on GitHub
              </a>
            </div>

            <p className="mt-4 text-sm text-slate-400">
              No signup required. Bring your own Anthropic API key or try demo
              mode (3 questions free).
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="px-4 py-16">
          <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-slate-800">Any Role</h3>
              <p className="mt-2 text-sm text-slate-500">
                Software engineer, PM, sales, designer, marketing, leadership.
                Paste a job description for fully personalized questions.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-slate-800">Real-time Scoring</h3>
              <p className="mt-2 text-sm text-slate-500">
                4-axis rubric: domain expertise, English fluency (CEFR), structure,
                and confidence. Per-turn feedback with strengths and gaps.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <Mic className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-slate-800">Voice Mode</h3>
              <p className="mt-2 text-sm text-slate-500">
                Speak your answers naturally. The AI interviewer speaks back.
                Practice the way a real interview feels — or use text mode.
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-slate-100 bg-slate-50/50 px-4 py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-slate-900">How it works</h2>
            <div className="mt-8 grid gap-6 text-left sm:grid-cols-3">
              <div>
                <div className="mb-2 font-mono text-2xl font-bold text-indigo-600">1</div>
                <h4 className="font-semibold text-slate-800">Choose your role</h4>
                <p className="mt-1 text-sm text-slate-500">
                  Pick a template or paste a full job description. The AI generates
                  a personalized interviewer and questions.
                </p>
              </div>
              <div>
                <div className="mb-2 font-mono text-2xl font-bold text-indigo-600">2</div>
                <h4 className="font-semibold text-slate-800">Interview</h4>
                <p className="mt-1 text-sm text-slate-500">
                  Answer questions one at a time. Voice or text. Get scored on each
                  answer instantly.
                </p>
              </div>
              <div>
                <div className="mb-2 font-mono text-2xl font-bold text-indigo-600">3</div>
                <h4 className="font-semibold text-slate-800">Review & improve</h4>
                <p className="mt-1 text-sm text-slate-500">
                  See aggregate scores, strengths, gaps, and specific improvement
                  tips. Download your transcript.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <AttributionFooter />
    </div>
  );
}
