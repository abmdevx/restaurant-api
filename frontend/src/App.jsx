import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  BrowserRouter,
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
const SESSION_KEY = 'restora_user'
const AuthContext = createContext(null)
const ThemeContext = createContext(null)

function useAuth() { return useContext(AuthContext) }
function useTheme() { return useContext(ThemeContext) }

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('restora_theme') || 'dark')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.dataset.theme = theme
    localStorage.setItem('restora_theme', theme)
  }, [theme])

  const value = useMemo(() => ({
    theme,
    toggleTheme: () => setTheme((current) => current === 'dark' ? 'light' : 'dark'),
  }), [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

function AuthProvider() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY)) || null
    } catch {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
  })

  const signIn = (nextUser) => {
    setUser(nextUser)
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextUser))
  }

  const signOut = async () => {
    try {
      await fetch(`${API_URL}/users/logout`, { method: 'POST', credentials: 'include' })
    } finally {
      setUser(null)
      localStorage.removeItem(SESSION_KEY)
    }
  }

  const value = useMemo(() => ({ user, signIn, signOut }), [user])
  return <AuthContext.Provider value={value}><Outlet /></AuthContext.Provider>
}

function Logo({ light = false }) {
  return <Link className={`inline-flex items-center gap-2 text-xl font-bold tracking-[-0.06em] ${light ? 'text-white' : 'text-stone-900 dark:text-stone-100'}`} to="/">
    <img className="h-9 w-9 object-contain" src="/restora.png" alt="" />
    restora
  </Link>
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  return <button className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/70 px-3 py-2 text-xs font-medium text-stone-600 shadow-sm transition hover:border-amber-500 hover:text-amber-700 dark:border-stone-700 dark:bg-stone-900/70 dark:text-stone-300 dark:hover:border-amber-400 dark:hover:text-amber-300" type="button" onClick={toggleTheme} aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}>
    <span className="text-base leading-none text-amber-500" aria-hidden="true">{isDark ? '☼' : '☾'}</span>
    <span className="hidden sm:inline">{isDark ? 'Light mode' : 'Dark mode'}</span>
  </button>
}

function PublicHeader() {
  const { user } = useAuth()
  return <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
    <Logo />
    <nav className="hidden items-center gap-8 text-sm text-stone-500 lg:flex dark:text-stone-400" aria-label="Main navigation">
      <a className="transition hover:text-amber-600 dark:hover:text-amber-400" href="#experience">Experience</a>
      <a className="transition hover:text-amber-600 dark:hover:text-amber-400" href="#features">Features</a>
      <a className="transition hover:text-amber-600 dark:hover:text-amber-400" href="#story">Our story</a>
    </nav>
    <div className="flex items-center gap-2 sm:gap-3">
      <ThemeToggle />
      {user ? <Link className="hidden rounded-full px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100 sm:inline-block dark:text-stone-200 dark:hover:bg-stone-800" to="/dashboard">Dashboard</Link> : <Link className="hidden rounded-full px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100 sm:inline-block dark:text-stone-200 dark:hover:bg-stone-800" to="/login">Sign in</Link>}
      {!user && <Link className="rounded-full bg-amber-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-amber-500/20 transition hover:-translate-y-0.5 hover:bg-amber-600 sm:px-5 sm:text-sm" to="/register">Get started <span aria-hidden="true">↗</span></Link>}
    </div>
  </header>
}

function HomePage() {
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
            <Feature icon="◌" title="Know your rhythm" text="See your day clearly, from reservations to the last order." />
            <Feature icon="⌁" title="Care for your guests" text="Give every guest the kind of attention they remember." />
            <Feature icon="✦" title="Grow with intention" text="Turn the details into decisions that move you forward." />
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

function HeroArtwork() {
  return <div className="relative mx-auto h-[450px] w-full max-w-[520px]">
    <div className="absolute right-4 top-12 h-80 w-80 rounded-full bg-amber-100 dark:bg-amber-950/40 sm:right-14" />
    <div className="absolute right-12 top-8 flex h-[390px] w-[290px] rotate-3 flex-col items-center justify-between border-[10px] border-[#fffaf0] bg-gradient-to-br from-amber-700 via-amber-500 to-yellow-300 p-6 shadow-2xl shadow-amber-950/20 dark:border-stone-800 sm:right-24">
      <span className="self-start text-[10px] tracking-[0.25em] text-white/80">01</span>
      <img className="h-52 w-52 object-contain drop-shadow-xl" src="/restora.png" alt="Restora logo" />
      <span className="text-[9px] uppercase tracking-[0.2em] text-white/90">Good food · better moments</span>
    </div>
    <div className="absolute bottom-8 left-2 grid -rotate-6 gap-1 bg-white p-5 shadow-xl dark:bg-stone-800"><span className="text-[10px] text-stone-400">Tonight's special</span><strong className="font-serif text-xl text-stone-800 dark:text-stone-100">Made with care</strong><span className="text-[10px] text-stone-400">Always</span></div>
    <span className="absolute left-16 top-8 text-4xl text-amber-500">✧</span><span className="absolute right-5 top-3 text-2xl text-amber-500">✦</span>
  </div>
}

function Feature({ icon, title, text }) {
  return <article className="group relative min-h-60 border border-stone-200 bg-white p-8 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-900/5 dark:border-stone-700 dark:bg-stone-900/60 dark:hover:shadow-black/20"><span className="text-3xl text-amber-500">{icon}</span><h3 className="mt-8 font-serif text-2xl text-stone-800 dark:text-stone-100">{title}</h3><p className="mt-3 max-w-xs text-sm leading-7 text-stone-500 dark:text-stone-400">{text}</p><span className="absolute bottom-7 right-8 text-xl text-amber-600 transition group-hover:-translate-y-1 group-hover:translate-x-1">↗</span></article>
}

function AuthLayout({ children, title, subtitle }) {
  return <div className="grid min-h-screen bg-[#fcfaf6] text-stone-900 dark:bg-[#141210] dark:text-stone-100 lg:grid-cols-[43%_57%]">
    <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#9b5319] via-[#d8861a] to-[#f0bf4f] p-10 text-white lg:block xl:p-14"><Logo light /><div className="absolute -bottom-40 -right-48 h-[580px] w-[580px] rounded-full border border-white/20" /><div className="absolute bottom-28 left-14"><span className="block h-10 font-serif text-8xl leading-none text-white/40">“</span><p className="font-serif text-5xl leading-[1.08]">There is no love<br />more sincere than<br />the love of food.</p><small className="mt-6 block text-xs tracking-widest text-white/75">— GEORGE BERNARD SHAW</small></div></aside>
    <main className="relative flex items-start justify-center px-6 py-8 sm:px-12 lg:items-center lg:px-20"><div className="absolute right-6 top-7 sm:right-12 lg:right-16"><ThemeToggle /></div><div className="w-full max-w-md"><div className="mb-16 lg:hidden"><Logo /></div><Link className="text-xs text-stone-500 transition hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-400" to="/">← Back to home</Link><p className="mt-14 text-[10px] font-bold uppercase tracking-[0.28em] text-amber-600 dark:text-amber-400">Welcome to Restora</p><h1 className="mt-5 text-5xl font-medium tracking-[-0.07em] sm:text-6xl">{title}</h1><p className="mt-4 text-sm leading-7 text-stone-500 dark:text-stone-400">{subtitle}</p>{children}</div></main>
  </div>
}

function Button({ children, ...props }) {
  return <button className="mt-2 inline-flex w-full items-center justify-center gap-3 rounded-xl bg-amber-500 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-amber-500/20 transition hover:-translate-y-0.5 hover:bg-amber-600 disabled:cursor-wait disabled:opacity-60" {...props}>{children}</button>
}

function AuthForm({ mode }) {
  const isRegister = mode === 'register'
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (isRegister && form.password !== form.confirmPassword) { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/users/${isRegister ? 'register' : 'login'}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ name: form.name, email: form.email, password: form.password }) })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.message || 'Something went wrong. Please try again.')
      if (isRegister) navigate('/login', { replace: true, state: { registered: true } })
      else { signIn(payload.data); navigate('/dashboard', { replace: true }) }
    } catch (submitError) { setError(submitError.message) } finally { setLoading(false) }
  }
  const inputClass = 'mt-2 w-full rounded-xl border border-stone-200 bg-white px-4 py-3.5 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-600'
  return <form className="mt-9 grid gap-5" onSubmit={submit}>
    {isRegister && <label className="text-xs font-bold text-stone-600 dark:text-stone-300">Full name<input className={inputClass} name="name" type="text" autoComplete="name" placeholder="Your name" value={form.name} onChange={update} minLength="2" required /></label>}
    <label className="text-xs font-bold text-stone-600 dark:text-stone-300">Email address<input className={inputClass} name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={update} required /></label>
    <label className="text-xs font-bold text-stone-600 dark:text-stone-300">Password<input className={inputClass} name="password" type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} placeholder={isRegister ? 'At least 8 characters' : 'Your password'} value={form.password} onChange={update} minLength={isRegister ? '8' : undefined} required /></label>
    {isRegister && <label className="text-xs font-bold text-stone-600 dark:text-stone-300">Confirm password<input className={inputClass} name="confirmPassword" type="password" autoComplete="new-password" placeholder="Repeat your password" value={form.confirmPassword} onChange={update} required /></label>}
    {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300" role="alert">{error}</p>}
    <Button type="submit" disabled={loading}>{loading ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'} <span aria-hidden="true">→</span></Button>
    <p className="text-center text-xs text-stone-500 dark:text-stone-400">{isRegister ? 'Already have an account?' : 'New to Restora?'} <Link className="font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400" to={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Create an account'}</Link></p>
  </form>
}

function LoginPage() {
  const location = useLocation()
  return <AuthLayout title="Welcome back." subtitle={location.state?.registered ? 'Your account is ready. Sign in to continue.' : 'Sign in to continue your Restora journey.'}><AuthForm mode="login" /></AuthLayout>
}

function RegisterPage() {
  return <AuthLayout title="Make room for more." subtitle="Create your account and bring a little more ease to every service."><AuthForm mode="register" /></AuthLayout>
}

function PrivateRoute() {
  const { user } = useAuth()
  return user ? <Outlet /> : <Navigate to="/login" replace />
}

function DashboardPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const name = user?.name?.split(' ')[0] || 'there'
  const logout = async () => { await signOut(); navigate('/', { replace: true }) }
  return <div className="min-h-screen bg-[#fcfaf6] text-stone-900 dark:bg-[#141210] dark:text-stone-100"><header className="flex h-20 items-center justify-between border-b border-stone-200 bg-white px-5 dark:border-stone-800 dark:bg-stone-900/60 sm:px-10"><Logo /><div className="flex items-center gap-5"><ThemeToggle /><span className="hidden text-sm text-stone-500 sm:inline dark:text-stone-400">Hi, {name}</span><button className="text-xs font-bold text-amber-600 dark:text-amber-400" onClick={logout}>Sign out</button></div></header><main className="mx-auto max-w-5xl px-5 py-20 sm:px-10"><p className="text-[10px] font-bold uppercase tracking-[0.28em] text-amber-600 dark:text-amber-400">Your Restora space</p><h1 className="mt-5 text-5xl font-medium tracking-[-0.07em] sm:text-6xl">Good morning, <span className="font-serif italic text-amber-600 dark:text-amber-400">{name}.</span></h1><p className="mt-5 text-sm text-stone-500 dark:text-stone-400">Everything you need for a beautifully run service, all in one calm place.</p><div className="mt-14 grid gap-5 md:grid-cols-[1.3fr_0.7fr]"><div className="min-h-64 rounded-2xl bg-[#eee0c8] p-8 dark:bg-[#3b2c1d]"><span className="text-2xl text-amber-600">✦</span><p className="mt-8 text-xs text-stone-500 dark:text-stone-400">Coming soon</p><h2 className="mt-2 font-serif text-3xl">Your service overview</h2><span className="mt-3 block text-xs text-stone-500 dark:text-stone-400">We’re preparing your dashboard.</span></div><div className="min-h-64 rounded-2xl border border-stone-200 bg-white p-8 dark:border-stone-700 dark:bg-stone-900/60"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600">Your profile</p><h2 className="mt-5 font-serif text-3xl">{user?.name || 'Restora guest'}</h2><p className="mt-2 text-sm text-stone-500 dark:text-stone-400">{user?.email}</p><span className="mt-6 inline-block rounded-full bg-amber-100 px-3 py-1.5 text-[10px] uppercase text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">{user?.role || 'customer'}</span></div></div></main></div>
}

function App() {
  return <BrowserRouter><ThemeProvider><Routes><Route element={<AuthProvider />}><Route path="/" element={<HomePage />} /><Route path="/login" element={<LoginPage />} /><Route path="/register" element={<RegisterPage />} /><Route element={<PrivateRoute />}><Route path="/dashboard" element={<DashboardPage />} /></Route><Route path="*" element={<Navigate to="/" replace />} /></Route></Routes></ThemeProvider></BrowserRouter>
}

export default App
