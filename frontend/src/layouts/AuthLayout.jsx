import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { ThemeToggle } from '../components/ThemeToggle'

export function AuthLayout({ children, title, subtitle }) {
  return <div className="grid min-h-screen bg-[#fcfaf6] text-stone-900 dark:bg-[#141210] dark:text-stone-100 lg:grid-cols-[43%_57%]">
    <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#9b5319] via-[#d8861a] to-[#f0bf4f] p-10 text-white lg:block xl:p-14">
      <Logo light />
      <div className="absolute -bottom-40 -right-48 h-[580px] w-[580px] rounded-full border border-white/20" />
      <div className="absolute bottom-28 left-14">
        <span className="block h-10 font-serif text-8xl leading-none text-white/40">“</span>
        <p className="font-serif text-5xl leading-[1.08]">There is no love<br />more sincere than<br />the love of food.</p>
        <small className="mt-6 block text-xs tracking-widest text-white/75">— GEORGE BERNARD SHAW</small>
      </div>
    </aside>
    <main className="relative flex items-start justify-center px-6 py-8 sm:px-12 lg:items-center lg:px-20">
      <div className="absolute right-6 top-7 sm:right-12 lg:right-16"><ThemeToggle /></div>
      <div className="w-full max-w-md">
        <div className="mb-16 lg:hidden"><Logo /></div>
        <Link className="text-xs text-stone-500 transition hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-400" to="/">← Back to home</Link>
        <p className="mt-14 text-[10px] font-bold uppercase tracking-[0.28em] text-amber-600 dark:text-amber-400">Welcome to Restora</p>
        <h1 className="mt-5 text-5xl font-medium tracking-[-0.07em] sm:text-6xl">{title}</h1>
        <p className="mt-4 text-sm leading-7 text-stone-500 dark:text-stone-400">{subtitle}</p>
        {children}
      </div>
    </main>
  </div>
}
