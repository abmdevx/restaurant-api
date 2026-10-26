export function FeatureCard({ icon, title, text }) {
  return <article className="group relative min-h-60 border border-stone-200 bg-white p-8 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-900/5 dark:border-stone-700 dark:bg-stone-900/60 dark:hover:shadow-black/20">
    <span className="text-3xl text-amber-500">{icon}</span>
    <h3 className="mt-8 font-serif text-2xl text-stone-800 dark:text-stone-100">{title}</h3>
    <p className="mt-3 max-w-xs text-sm leading-7 text-stone-500 dark:text-stone-400">{text}</p>
    <span className="absolute bottom-7 right-8 text-xl text-amber-600 transition group-hover:-translate-y-1 group-hover:translate-x-1">↗</span>
  </article>
}
