import { Link } from 'react-router-dom'
import { FeatureCard } from '../components/FeatureCard'
import { HeroArtwork } from '../components/HeroArtwork'
import { Logo } from '../components/Logo'
import { PublicHeader } from '../components/PublicHeader'

export function HomePage() {
  return <div className="min-h-screen overflow-hidden bg-[#fcfaf6] text-stone-900 transition-colors dark:bg-[#141210] dark:text-stone-100">
    <PublicHeader />
    <main>
      <section className="relative mx-auto grid min-h-[680px] w-full max-w-7xl items-center gap-12 px-5 pb-16 pt-16 sm:px-8 lg:grid-cols-[1fr_0.9fr] lg:px-10 lg:pt-20" id="experience">
        <div className="relative z-10">
          <p className="mb-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.28em] text-amber-600 dark:text-amber-400"><span className="h-px w-8 bg-current" /> Good food. Better moments.</p>
          <h1 className="max-w-3xl text-5xl font-medium leading-[1.02] tracking-[-0.07em] sm:text-7xl lg:text-[5.6rem]">Make every table feel <span className="font-serif italic text-amber-600 dark:text-amber-400">like home.</span></h1>
          <p className="mt-7 max-w-md text-base leading-8 text-stone-500 dark:text-stone-400">A beautifully simple way to bring your restaurant, your team, and your guests together.</p>
          <div className="mt-9 flex flex-wrap items-center gap-5">
            <Link className="rounded-full bg-amber-500 px-6 py-4 text-sm font-bold text-white shadow-xl shadow-amber-500/20 transition hover:-translate-y-1 hover:bg-amber-600" to="/register">Start your journey <span className="ml-3" aria-hidden="true">→</span></Link>
            <a className="border-b border-amber-500 pb-1 text-sm font-medium text-stone-700 dark:text-stone-200" href="#features">Explore Restora ↓</a>
          </div>
          <div className="mt-16 flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400"><span>Trusted by thoughtful teams</span><span className="text-amber-500">✦ ✦ ✦</span></div>
        </div>
        <HeroArtwork />
      </section>
      <section className="bg-[#f2ece3] px-5 py-24 dark:bg-[#201b17] sm:px-8 lg:px-10" id="features">
        <div className="mx-auto max-w-7xl">
          <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.28em] text-amber-600 dark:text-amber-400">Everything in one place</p>
          <h2 className="max-w-2xl text-4xl font-medium tracking-[-0.06em] sm:text-6xl">Hospitality, <span className="font-serif italic text-amber-600 dark:text-amber-400">made human.</span></h2>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            <FeatureCard icon="◌" title="Know your rhythm" text="See your day clearly, from reservations to the last order." />
            <FeatureCard icon="⌁" title="Care for your guests" text="Give every guest the kind of attention they remember." />
            <FeatureCard icon="✦" title="Grow with intention" text="Turn the details into decisions that move you forward." />
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-5xl gap-10 px-5 py-28 sm:px-8 lg:grid-cols-[1fr_0.7fr] lg:items-end lg:gap-28" id="story">
        <div><p className="mb-5 text-[10px] font-bold uppercase tracking-[0.28em] text-amber-600 dark:text-amber-400">Built for the people behind the table</p><h2 className="text-4xl font-medium leading-tight tracking-[-0.06em] sm:text-6xl">Your craft deserves a <span className="font-serif italic text-amber-600 dark:text-amber-400">calmer</span> way to work.</h2></div>
        <p className="text-sm leading-8 text-stone-500 dark:text-stone-400">Restora gives independent restaurants the clarity and care of a dedicated team, without losing the warmth that makes them special.</p>
      </section>
    </main>
    <footer className="mx-auto flex w-full max-w-7xl flex-col gap-4 border-t border-stone-200 px-5 py-7 text-xs text-stone-400 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10 dark:border-stone-800"><Logo /><span>© 2024 Restora. Made for memorable moments.</span><span className="uppercase tracking-widest">Good food <b className="text-amber-500">·</b> better moments</span></footer>
  </div>
}
