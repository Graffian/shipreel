import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center pt-24 text-center">
      <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight">
        Turn screen recordings into{" "}
        <span className="bg-gradient-to-r from-shipreel-400 to-cyan-300 bg-clip-text text-transparent">
          viral launch reels
        </span>
      </h1>
      <p className="mt-6 max-w-xl text-lg text-slate-400">
        Upload your product demo, add a changelog, and let AI craft a
        stunning vertical reel with captions, zooms, and transitions.
      </p>
      <div className="mt-10 flex gap-4">
        <Link
          href="/upload"
          className="rounded-xl bg-shipreel-600 px-8 py-4 text-lg font-semibold hover:bg-shipreel-500 transition-all"
        >
          Create Your First Reel
        </Link>
        <Link
          href="/dashboard"
          className="rounded-xl border border-slate-700 px-8 py-4 text-lg font-semibold text-slate-300 hover:border-slate-500 transition-all"
        >
          View Dashboard
        </Link>
      </div>

      <div className="mt-24 grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          {
            title: "Upload",
            desc: "Screen recording + changelog text",
          },
          {
            title: "AI Edit",
            desc: "Auto captions, zooms, hook generation",
          },
          {
            title: "Export",
            desc: "Polished 9:16 reel ready to ship",
          },
        ].map((step) => (
          <div
            key={step.title}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-6"
          >
            <h3 className="text-lg font-semibold text-white">{step.title}</h3>
            <p className="mt-2 text-sm text-slate-400">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
