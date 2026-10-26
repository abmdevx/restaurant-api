import { useTheme } from '../hooks/useTheme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  return <button className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/70 px-3 py-2 text-xs font-medium text-stone-600 shadow-sm transition hover:border-amber-500 hover:text-amber-700 dark:border-stone-700 dark:bg-stone-900/70 dark:text-stone-300 dark:hover:border-amber-400 dark:hover:text-amber-300" type="button" onClick={toggleTheme} aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}>
    <span className="text-base leading-none text-amber-500" aria-hidden="true">{isDark ? '☼' : '☾'}</span>
    <span className="hidden sm:inline">{isDark ? 'Light mode' : 'Dark mode'}</span>
  </button>
}
