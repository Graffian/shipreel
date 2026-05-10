import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShipReel — Launch Reels, Instantly",
  description: "Turn screen recordings into polished launch reels with AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-white antialiased">
        <nav className="border-b border-slate-800 px-6 py-4">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <a href="/" className="text-xl font-bold tracking-tight text-white">
              Ship<span className="text-shipreel-400">Reel</span>
            </a>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <a href="/dashboard" className="hover:text-white transition-colors">
                Dashboard
              </a>
              <a
                href="/upload"
                className="rounded-lg bg-shipreel-600 px-4 py-2 text-white hover:bg-shipreel-500 transition-colors"
              >
                New Project
              </a>
            </div>
          </div>
        </nav>
        <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
