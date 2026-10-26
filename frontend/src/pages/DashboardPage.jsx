import { useAuth } from '../hooks/useAuth'

export function DashboardPage() {
  const { user } = useAuth()
  const name = user?.name?.split(' ')[0] || 'there'
  return <main className="mx-auto max-w-5xl px-5 py-20 sm:px-10">
    <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-amber-600 dark:text-amber-400">Your Restora space</p>
    <h1 className="mt-5 text-5xl font-medium tracking-[-0.07em] sm:text-6xl">Good morning, <span className="font-serif italic text-amber-600 dark:text-amber-400">{name}.</span></h1>
    <p className="mt-5 text-sm text-stone-500 dark:text-stone-400">Everything you need for a beautifully run service, all in one calm place.</p>
    <div className="mt-14 grid gap-5 md:grid-cols-[1.3fr_0.7fr]">
      <div className="min-h-64 rounded-2xl bg-[#eee0c8] p-8 dark:bg-[#3b2c1d]"><span className="text-2xl text-amber-600">✦</span><p className="mt-8 text-xs text-stone-500 dark:text-stone-400">Coming soon</p><h2 className="mt-2 font-serif text-3xl">Your service overview</h2><span className="mt-3 block text-xs text-stone-500 dark:text-stone-400">We’re preparing your dashboard.</span></div>
      <div className="min-h-64 rounded-2xl border border-stone-200 bg-white p-8 dark:border-stone-700 dark:bg-stone-900/60"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600">Your profile</p><h2 className="mt-5 font-serif text-3xl">{user?.name || 'Restora guest'}</h2><p className="mt-2 text-sm text-stone-500 dark:text-stone-400">{user?.email}</p><span className="mt-6 inline-block rounded-full bg-amber-100 px-3 py-1.5 text-[10px] uppercase text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">{user?.role || 'customer'}</span></div>
    </div>
  </main>
}
