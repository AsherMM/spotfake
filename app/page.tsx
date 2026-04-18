import GamePreview from "@/app/components/game-preview";

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(236,72,153,0.16),transparent_25%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.14),transparent_20%),radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.05),transparent_30%)]" />

      <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="#top" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 via-fuchsia-500 to-purple-500 text-lg font-black shadow-lg shadow-pink-500/20">
              🔥
            </div>
            <div>
              <div className="text-lg font-black tracking-tight">Spotfake</div>
              <div className="text-xs text-zinc-500">Real or AI image challenge</div>
            </div>
          </a>

          <nav className="hidden items-center gap-8 text-sm text-zinc-300 md:flex">
            <a href="/game" className="transition hover:text-white">Play</a>
            <a href="#why-it-hits" className="transition hover:text-white">Why it hits</a>
            <a href="#seo" className="transition hover:text-white">About</a>
            <a href="#faq" className="transition hover:text-white">FAQ</a>
          </nav>

          <a
            href="auth/signup"
            className="rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-pink-500/20 transition hover:scale-105 hover:shadow-pink-500/30"
          >
            PLAY NOW
          </a>
        </div>
      </header>

      <main id="top" className="relative z-10">
        <section className="px-4 pb-16 pt-28 sm:px-6 lg:px-8 lg:pb-20 lg:pt-32">
          <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.02fr_0.98fr]">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-pink-500/20 bg-pink-500/10 px-4 py-2 text-sm text-pink-200">
                <span className="h-2 w-2 rounded-full bg-pink-400" />
                Viral browser game concept · AI image challenge
              </div>

              <h1 className="text-4xl font-black leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl xl:text-[5.25rem]">
                99% of people
                <br />
                <span className="bg-gradient-to-r from-pink-500 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent">
                  fail this test.
                </span>
                <br />
                Can you spot the fake?
              </h1>

              <p className="mt-7 max-w-2xl text-base leading-8 text-zinc-300 sm:text-xl">
                Spotfake is a fast-paced AI image detection game where you have one second to decide if an image is real or AI-generated. Easy to understand, brutal under pressure, and built to make players instantly want one more try.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="/auth/signup"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-7 py-4 text-base font-black text-white shadow-xl shadow-pink-500/20 transition hover:scale-[1.02] hover:shadow-pink-500/30"
                >
                  START THE CHALLENGE
                </a>
                <a
                  href="#why-it-hits"
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-7 py-4 text-base font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
                >
                  Why it’s addictive
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 text-sm">
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-zinc-200">🔥 12,000+ players reached</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-zinc-200">⚡ Average score: 7</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-zinc-200">💀 Top 10% reach 19+</span>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                  <div className="text-2xl font-black text-white">1 sec</div>
                  <div className="mt-2 text-sm text-zinc-400">to choose between real and fake</div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                  <div className="text-2xl font-black text-white">300+</div>
                  <div className="mt-2 text-sm text-zinc-400">starter images across multiple categories</div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                  <div className="text-2xl font-black text-white">∞</div>
                  <div className="mt-2 text-sm text-zinc-400">replay potential with rising difficulty</div>
                </div>
              </div>
            </div>

            <div id="game" className="relative mx-auto w-full max-w-md lg:max-w-lg">
              <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-pink-500/20 via-fuchsia-500/10 to-purple-500/20 blur-2xl" />
              <div className="relative rounded-[2rem] border border-white/10 bg-zinc-900/80 p-4 shadow-2xl shadow-black/60 backdrop-blur-xl sm:p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">Live game preview</div>
                    <div className="mt-1 text-lg font-bold">You have 1 second. Real or Fake?</div>
                  </div>
                  <div className="rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-1 text-sm font-semibold text-pink-200">
                    Streak 11 🔥
                  </div>
                </div>

                <div className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-zinc-950">
                  <img
                    src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80"
                    alt="Spotfake preview showing an image challenge where players must decide if the image is real or AI-generated"
                    className="h-72 w-full object-cover sm:h-80"
                  />
                </div>

                <div className="mt-4 h-2.5 rounded-full bg-white/10">
                  <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500" />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button className="rounded-[1.35rem] border border-white/10 bg-zinc-800 px-4 py-4 text-lg font-black tracking-wide transition hover:scale-[1.02] hover:bg-zinc-700">
                    REAL
                  </button>
                  <button className="rounded-[1.35rem] bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-4 text-lg font-black tracking-wide text-white shadow-lg shadow-pink-500/20 transition hover:scale-[1.02]">
                    FAKE
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-zinc-500">Best</div>
                    <div className="mt-1 text-lg font-black">27</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-zinc-500">Accuracy</div>
                    <div className="mt-1 text-lg font-black">81%</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-zinc-500">Rank</div>
                    <div className="mt-1 text-lg font-black">Top 14%</div>
                  </div>
                </div>

                <div className="mt-4 rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-semibold text-zinc-300">Why players keep retrying</div>
                  <p className="mt-2 text-sm leading-7 text-zinc-400">
                    The image looks obvious until the timer starts. Then doubt kicks in, one mistake ends the run, and the next attempt feels irresistible.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/5 bg-white/[0.02] px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 text-center sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-6">
              <div className="text-2xl">⚡</div>
              <div className="mt-3 text-lg font-bold">Instant gameplay</div>
              <p className="mt-2 text-sm leading-7 text-zinc-400">No install, no tutorial wall, no waiting. Open the page and play immediately.</p>
            </div>
            <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-6">
              <div className="text-2xl">🔥</div>
              <div className="mt-3 text-lg font-bold">Streak pressure</div>
              <p className="mt-2 text-sm leading-7 text-zinc-400">Every correct answer increases tension because one mistake wipes the run.</p>
            </div>
            <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-6">
              <div className="text-2xl">🧠</div>
              <div className="mt-3 text-lg font-bold">Psychological traps</div>
              <p className="mt-2 text-sm leading-7 text-zinc-400">Some AI images look too perfect. Some real photos look suspicious. That doubt is the game.</p>
            </div>
            <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-6">
              <div className="text-2xl">📱</div>
              <div className="mt-3 text-lg font-bold">Built for mobile</div>
              <p className="mt-2 text-sm leading-7 text-zinc-400">Quick taps, fast feedback, and a one-more-try loop made for phones and desktop alike.</p>
            </div>
          </div>
        </section>

        <section id="why-it-hits" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="text-sm font-bold uppercase tracking-[0.22em] text-zinc-500">Why it hits</div>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              Simple. Brutal. Addictive.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-300">
              Spotfake works because it turns a modern internet obsession into a fast reaction challenge. It is easy to explain, impossible to fully trust yourself, and designed to create instant replay behavior.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-7">
              <div className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">01</div>
              <h3 className="mt-4 text-2xl font-black">Immediate clarity</h3>
              <p className="mt-3 leading-8 text-zinc-300">
                The rule is understood instantly: decide if the image is real or AI-generated before the timer runs out.
              </p>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-7">
              <div className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">02</div>
              <h3 className="mt-4 text-2xl font-black">Emotional loop</h3>
              <p className="mt-3 leading-8 text-zinc-300">
                The combination of time pressure, uncertainty, and streak loss creates frustration in the best possible way.
              </p>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-7">
              <div className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">03</div>
              <h3 className="mt-4 text-2xl font-black">Built to be shared</h3>
              <p className="mt-3 leading-8 text-zinc-300">
                Scores, reactions, close failures, and “I thought that was real” moments are naturally social and clip-friendly.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/8 to-white/[0.03] p-8">
              <div className="text-sm font-bold uppercase tracking-[0.22em] text-zinc-500">Gameplay loop</div>
              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                Fast enough to start instantly. Hard enough to stay interesting.
              </h2>

              <div className="mt-8 space-y-4">
                {[
                  "One image appears on screen.",
                  "The player must choose Real or Fake in under one second.",
                  "A correct answer extends the streak and increases pressure.",
                  "A mistake ends the run and triggers the urge to try again immediately.",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-zinc-950/50 p-4">
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500" />
                    <p className="text-zinc-300">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
              <div className="text-sm font-bold uppercase tracking-[0.22em] text-zinc-500">Content structure</div>
              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                Enough variety to keep the brain guessing.
              </h2>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  "Real faces",
                  "AI faces",
                  "Landscapes",
                  "Animals",
                  "Objects",
                  "Complex scenes",
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-zinc-950/50 p-4 text-zinc-200">
                    {item}
                  </div>
                ))}
              </div>

              <p className="mt-6 leading-8 text-zinc-300">
                This mix helps Spotfake feel deeper than a gimmick. Players do not simply memorize one category. They learn to question everything.
              </p>
            </div>
          </div>
        </section>

        <section id="seo" className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 sm:p-10">
            <div className="text-sm font-bold uppercase tracking-[0.22em] text-zinc-500">About Spotfake</div>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              Real vs AI images test — can you actually tell the difference?
            </h2>

            <div className="mt-6 space-y-5 text-base leading-8 text-zinc-300 sm:text-lg">
              <p>
                Spotfake is a browser-based AI image detection game where players try to distinguish real images from AI-generated images under time pressure. The concept is built around a simple question that millions of people are already asking online: can you still recognize what is real?
              </p>
              <p>
                As artificial intelligence becomes better at generating realistic visuals, more users are searching for ways to identify fake images, test their perception, and compare AI-generated photos with real photography. Spotfake turns that curiosity into a challenge-based experience that is fast, replayable, and naturally social.
              </p>
              <p>
                Whether someone is looking for an AI image test, a real vs fake photo challenge, or a browser game that feels different from the usual endless runner or puzzle clone, Spotfake offers a modern hook. It connects entertainment, internet culture, and AI awareness in a format that is easy to click and hard to master.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-7">
              <div className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">Traffic angle</div>
              <h3 className="mt-4 text-2xl font-black">Search-friendly</h3>
              <p className="mt-3 leading-8 text-zinc-300">
                Strong alignment with search intent around AI image detection, fake images, and real vs AI visual tests.
              </p>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-7">
              <div className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">Retention angle</div>
              <h3 className="mt-4 text-2xl font-black">Replay-first</h3>
              <p className="mt-3 leading-8 text-zinc-300">
                Fast rounds and visible streak progression make players want another run immediately after losing.
              </p>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-7">
              <div className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">Viral angle</div>
              <h3 className="mt-4 text-2xl font-black">Shareable by nature</h3>
              <p className="mt-3 leading-8 text-zinc-300">
                High scores, disbelief, and close failures are exactly the kind of outcomes people love posting and comparing.
              </p>
            </div>
          </div>
        </section>

        <section className="px-4 pb-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl rounded-[2.2rem] border border-white/10 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 p-[1px] shadow-2xl shadow-pink-500/10">
            <div className="rounded-[2.15rem] bg-black px-8 py-10 text-center sm:px-10 sm:py-14">
              <div className="text-sm font-bold uppercase tracking-[0.22em] text-pink-200">Ready?</div>
              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
                Think you’re better than average?
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-zinc-300">
                Prove it. Train your eye, trust your instincts, and see how long you can survive before the next fake catches you.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a
                  href="#game"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-8 py-4 text-lg font-black text-white shadow-xl shadow-pink-500/20 transition hover:scale-[1.03]"
                >
                  START THE CHALLENGE
                </a>
                <a
                  href="#seo"
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-8 py-4 text-lg font-semibold text-white transition hover:bg-white/10"
                >
                  Learn more
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-sm font-bold uppercase tracking-[0.22em] text-zinc-500">FAQ</div>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">Frequently asked questions</h2>
          </div>

          <div className="mt-12 space-y-4">
            <div className="rounded-[1.7rem] border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-black">What is Spotfake?</h3>
              <p className="mt-2 leading-8 text-zinc-300">
                Spotfake is an online browser game where players must decide whether an image is real or AI-generated before the timer runs out.
              </p>
            </div>
            <div className="rounded-[1.7rem] border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-black">Is Spotfake free to play?</h3>
              <p className="mt-2 leading-8 text-zinc-300">
                Yes. Spotfake is designed to be easy to access directly in the browser, with no installation required.
              </p>
            </div>
            <div className="rounded-[1.7rem] border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-black">Can I play on mobile?</h3>
              <p className="mt-2 leading-8 text-zinc-300">
                Yes. The gameplay format is built for both quick taps on mobile and fast clicks on desktop.
              </p>
            </div>
            <div className="rounded-[1.7rem] border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-black">Why is Spotfake different from other browser games?</h3>
              <p className="mt-2 leading-8 text-zinc-300">
                It combines modern AI curiosity, instant gameplay, and a harsh streak-based challenge loop instead of relying on a generic casual formula.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 bg-black/80 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-center text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div>Spotfake © 2026. All rights reserved.</div>
          <div className="flex items-center justify-center gap-6 sm:justify-end">
            <a href="#faq" className="transition hover:text-white">FAQ</a>
            <a href="#seo" className="transition hover:text-white">About</a>
            <a href="#game" className="transition hover:text-white">Play</a>
          </div>
        </div>
      </footer>
    </div>
  );
}