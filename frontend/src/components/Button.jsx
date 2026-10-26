export function Button({ children, ...props }) {
  return <button className="mt-2 inline-flex w-full items-center justify-center gap-3 rounded-xl bg-amber-500 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-amber-500/20 transition hover:-translate-y-0.5 hover:bg-amber-600 disabled:cursor-wait disabled:opacity-60" {...props}>{children}</button>
}
