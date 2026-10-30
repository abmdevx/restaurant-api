import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { ThemeToggle } from '../components/ThemeToggle'
import { useAuth } from '../hooks/useAuth'

// ── Nav links config ──────────────────────────────────────────────────────────
const ADMIN_NAV = [
  { to: '/dashboard', label: '🍽️ Tables', end: true },
  { to: '/orders', label: '📝 Orders' },
  { to: '/menu', label: '🍴 Menu' },
  { to: '/inventory', label: '📦 Inventory' },
]

const CUSTOMER_NAV = [{ to: '/dashboard', label: '🪑 Reserve a Table', end: true }]

// ── Hamburger Icon ────────────────────────────────────────────────────────────
function HamburgerIcon({ open }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      {open ? (
        <>
          <line x1="4" y1="4" x2="18" y2="18" />
          <line x1="18" y1="4" x2="4" y2="18" />
        </>
      ) : (
        <>
          <line x1="3" y1="6" x2="19" y2="6" />
          <line x1="3" y1="11" x2="19" y2="11" />
          <line x1="3" y1="16" x2="19" y2="16" />
        </>
      )}
    </svg>
  )
}

// ── Desktop NavLink ───────────────────────────────────────────────────────────
function DesktopNavLink({ to, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
          isActive
            ? 'bg-amber-500/10 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
            : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
        }`
      }
    >
      {label}
    </NavLink>
  )
}

// ── Drawer NavLink ────────────────────────────────────────────────────────────
function DrawerNavLink({ to, label, end, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold transition ${
          isActive
            ? 'bg-amber-500/10 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
            : 'text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800'
        }`
      }
    >
      {label}
    </NavLink>
  )
}

// ── View Toggle Button (reused in header + drawer) ────────────────────────────
function ViewToggleButton({ previewCustomer, onToggle, compact = false }) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-1.5 rounded-xl border font-semibold transition ${
        previewCustomer
          ? 'border-amber-300 bg-amber-500 text-white hover:bg-amber-600 dark:border-amber-600'
          : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
      } ${compact ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs'}`}
    >
      <span>{previewCustomer ? '🛡️' : '👀'}</span>
      <span className={compact ? 'hidden sm:inline' : ''}>
        {previewCustomer ? 'Admin View' : 'Customer View'}
      </span>
    </button>
  )
}

// ── Main Layout ───────────────────────────────────────────────────────────────
export function DashboardLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const name = user?.name?.split(' ')[0] || 'there'
  const role = user?.role || 'customer'
  const isAdmin = role === 'admin'
  const navLinks = isAdmin ? ADMIN_NAV : CUSTOMER_NAV

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [previewCustomer, setPreviewCustomer] = useState(false)

  const togglePreview = () => setPreviewCustomer((v) => !v)

  const logout = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  // Close drawer on ESC
  useEffect(() => {
    if (!drawerOpen) return
    const handler = (e) => { if (e.key === 'Escape') setDrawerOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [drawerOpen])

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  return (
    <div className="min-h-screen bg-[#fcfaf6] text-stone-900 dark:bg-[#141210] dark:text-stone-100">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-stone-200 bg-white px-4 dark:border-stone-800 dark:bg-stone-900/95 sm:h-20 sm:px-10">
        {/* Left: hamburger (mobile) + logo + desktop nav */}
        <div className="flex items-center gap-3 sm:gap-8">
          {/* Hamburger — mobile only */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-xl text-stone-600 transition hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 sm:hidden"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <HamburgerIcon open={false} />
          </button>

          <Logo />

          {/* Desktop nav — hidden on mobile */}
          <nav className="hidden items-center gap-1.5 sm:flex">
            {/* Show admin or customer nav based on preview mode */}
            {(isAdmin && !previewCustomer ? ADMIN_NAV : CUSTOMER_NAV).map((link) => (
              <DesktopNavLink key={link.to} {...link} />
            ))}
          </nav>
        </div>

        {/* Right: view toggle (admin only) + theme + user info + sign out */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* View toggle — always a button, always visible for admins */}
          {isAdmin && (
            <ViewToggleButton
              previewCustomer={previewCustomer}
              onToggle={togglePreview}
              compact
            />
          )}

          <ThemeToggle />

          {/* User info — desktop only */}
          <div className="hidden items-center gap-2 sm:flex">
            <span className="text-sm text-stone-600 dark:text-stone-400">Hi, {name}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                role === 'admin'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                  : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
              }`}
            >
              {role}
            </span>
          </div>

          <button
            className="hidden text-xs font-bold text-amber-600 transition hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 sm:block"
            onClick={logout}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* ── Mobile Drawer Backdrop ───────────────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 sm:hidden ${
          drawerOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* ── Mobile Drawer Panel ──────────────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:bg-stone-900 sm:hidden ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4 dark:border-stone-800">
          <Logo />
          <button
            className="flex h-9 w-9 items-center justify-center rounded-xl text-stone-500 transition hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
          >
            <HamburgerIcon open={true} />
          </button>
        </div>

        {/* User info pill */}
        <div className="mx-4 mt-4 flex items-center gap-3 rounded-2xl bg-amber-50 px-4 py-3 dark:bg-amber-950/20">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500 font-bold text-white">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-stone-900 dark:text-stone-100">
              {user?.name || 'Guest'}
            </p>
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                role === 'admin'
                  ? 'bg-amber-200 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                  : 'bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-400'
              }`}
            >
              {role}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-5 px-5">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
            Navigation
          </p>
          <nav className="flex flex-col gap-1">
            {(isAdmin && !previewCustomer ? ADMIN_NAV : CUSTOMER_NAV).map((link) => (
              <DrawerNavLink
                key={link.to}
                {...link}
                onClick={() => setDrawerOpen(false)}
              />
            ))}
          </nav>
        </div>

        <div className="mx-5 my-4 border-t border-stone-100 dark:border-stone-800" />

        {/* Account section */}
        <div className="px-5">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
            Account
          </p>
          <div className="flex flex-col gap-1">
            {/* View Toggle — full-width in drawer */}
            {isAdmin && (
              <button
                onClick={() => { togglePreview(); setDrawerOpen(false) }}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold transition ${
                  previewCustomer
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                    : 'text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800'
                }`}
              >
                <span>{previewCustomer ? '🛡️' : '👀'}</span>
                {previewCustomer ? 'Switch to Admin View' : 'Switch to Customer View'}
              </button>
            )}

            <div className="flex items-center justify-between rounded-2xl px-4 py-3">
              <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                🌙 Dark Mode
              </span>
              <ThemeToggle />
            </div>

            <button
              onClick={() => { setDrawerOpen(false); logout() }}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto border-t border-stone-100 px-5 py-4 dark:border-stone-800">
          <p className="text-center text-xs text-stone-400 dark:text-stone-500">
            Restora · Restaurant Management
          </p>
        </div>
      </aside>

      {/* ── Page Content ────────────────────────────────────────────────────── */}
      {/* Pass previewCustomer state down to child pages via Outlet context */}
      <Outlet context={{ previewCustomer }} />
    </div>
  )
}
