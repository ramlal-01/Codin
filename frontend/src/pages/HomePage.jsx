import { Footer } from "../components/layout/Footer.jsx";
import { Navbar } from "../components/layout/Navbar.jsx";
import { HeroSection } from "../components/home/HeroSection.jsx";

function HomePage() {
  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-slate-950 text-slate-50">
      <Navbar />
      <main className="w-full flex-1">
        <section className="mx-auto grid min-h-[calc(100vh-112px)] w-full max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:py-14">
          <HeroSection />
          <div className="min-w-0">
            <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900 shadow-2xl shadow-cyan-950/20">
              <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                <div className="flex gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="h-3 w-3 rounded-full bg-yellow-400" />
                  <span className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <span className="text-xs text-slate-500">room/mock-interview-42</span>
              </div>
              <div className="grid min-w-0 gap-0 md:grid-cols-[1fr_170px]">
                <div className="min-w-0 border-b border-slate-800 md:border-b-0 md:border-r">
                  <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2 text-xs text-slate-400">
                    <span>JavaScript</span>
                    <span className="rounded bg-green-950 px-2 py-1 text-green-300">Connected</span>
                  </div>
                  <pre className="overflow-x-auto p-4 text-sm leading-6 text-slate-300">
                    <code>{`function twoSum(nums, target) {
  const seen = new Map();

  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
}`}</code>
                  </pre>
                </div>
                <div className="min-w-0 p-4">
                  <h2 className="text-sm font-semibold text-white">Live session</h2>
                  <div className="mt-3 space-y-3 text-xs">
                    <div className="rounded border border-slate-800 bg-slate-950 p-3">
                      <p className="font-semibold text-cyan-300">Aarav</p>
                      <p className="mt-1 text-slate-400">Let's test the hash map case.</p>
                    </div>
                    <div className="rounded border border-slate-800 bg-slate-950 p-3">
                      <p className="font-semibold text-violet-300">Mira</p>
                      <p className="mt-1 text-slate-400">I'll sketch the pointer flow.</p>
                    </div>
                    <div className="rounded border border-cyan-900 bg-cyan-950/40 p-3 text-cyan-100">
                      Output: Accepted in 0.02s
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-slate-800 bg-slate-900/60">
          <div className="mx-auto grid max-w-6xl gap-4 px-4 py-10 md:grid-cols-3">
            {[
              ["Mock interviews", "Share one room, explain your approach in chat, run code together, and keep a saved record of the session."],
              ["Pair debugging", "Reproduce a bug, try fixes side by side, and use the whiteboard to map data flow before editing."],
              ["Study groups", "Create reusable rooms for DSA practice, classroom walkthroughs, hackathon planning, or peer learning."],
            ].map(([title, text]) => (
              <article key={title} className="rounded-lg border border-slate-800 bg-slate-950 p-5">
                <h2 className="font-semibold text-white">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <h2 className="text-2xl font-bold">Built for the full problem-solving loop.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                CodIn keeps the important collaboration pieces connected to the same room, so your code, messages, whiteboard, and room history stay easy to find later.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Create or join rooms from a protected dashboard",
                "Synchronize code changes with Socket.IO",
                "Run JavaScript, Python, Java, C, and C++ through the backend",
                "Persist chat history for previous sessions",
                "Restore saved whiteboards by room",
                "Protect room data with JWT membership checks",
              ].map((item) => (
                <div key={item} className="rounded border border-slate-800 bg-slate-900 p-4 text-sm text-slate-300">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default HomePage;
