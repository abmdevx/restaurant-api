import { Link } from 'react-router-dom'

export function Logo({ light = false }) {
  return <Link className={`inline-flex items-center gap-2 text-xl font-bold tracking-[-0.06em] ${light ? 'text-white' : 'text-stone-900 dark:text-stone-100'}`} to="/">
    <img className="h-9 w-9 object-contain" src="/restora.png" alt="" />
    restora
  </Link>
}
