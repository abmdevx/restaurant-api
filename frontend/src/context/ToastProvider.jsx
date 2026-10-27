import { useCallback, useEffect, useMemo, useState } from 'react'
import { ToastContext } from './toastContext'

function CheckIcon({ className = 'h-5 w-5' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  )
}

function AlertTriangleIcon({ className = 'h-5 w-5' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  )
}

function XCircleIcon({ className = 'h-5 w-5' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  )
}

function InfoIcon({ className = 'h-5 w-5' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
    </svg>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [confirmState, setConfirmState] = useState(null)

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((type, message, title = '') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6)
    setToasts((prev) => [...prev, { id, type, message, title }])

    setTimeout(() => {
      removeToast(id)
    }, 4500)

    return id
  }, [removeToast])

  const toast = useMemo(() => {
    const fn = (message, title) => addToast('info', message, title)
    fn.success = (message, title) => addToast('success', message, title)
    fn.error = (message, title) => addToast('error', message, title)
    fn.warning = (message, title) => addToast('warning', message, title)
    fn.info = (message, title) => addToast('info', message, title)
    return fn
  }, [addToast])

  const confirm = useCallback(({
    title = 'Are you sure?',
    message = 'Please confirm this action.',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
  }) => {
    return new Promise((resolve) => {
      setConfirmState({
        title,
        message,
        confirmText,
        cancelText,
        variant,
        resolve,
      })
    })
  }, [])

  const handleConfirmAction = (value) => {
    if (confirmState?.resolve) {
      confirmState.resolve(value)
    }
    setConfirmState(null)
  }

  // Keyboard shortcut: Escape cancels confirmation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && confirmState) {
        handleConfirmAction(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [confirmState])

  const contextValue = useMemo(() => ({
    toast,
    confirm,
    removeToast,
  }), [toast, confirm, removeToast])

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* ─── Notification Toasts (Top-Right) ─────────────────────────── */}
      <div
        className="pointer-events-none fixed right-0 top-0 z-[9999] flex w-full max-w-sm flex-col gap-3 p-4 sm:p-6"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((item) => {
          const isSuccess = item.type === 'success'
          const isError = item.type === 'error'
          const isWarning = item.type === 'warning'

          return (
            <div
              key={item.id}
              className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-stone-200/90 bg-white/95 p-4 shadow-xl shadow-stone-900/5 backdrop-blur-md transition-all duration-200 dark:border-stone-800 dark:bg-stone-900/95 dark:shadow-black/20"
              role="alert"
            >
              <div
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                  isSuccess
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                    : isError
                    ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400'
                    : isWarning
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                    : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                }`}
              >
                {isSuccess ? (
                  <CheckIcon className="h-4 w-4" />
                ) : isError ? (
                  <XCircleIcon className="h-4 w-4" />
                ) : isWarning ? (
                  <AlertTriangleIcon className="h-4 w-4" />
                ) : (
                  <InfoIcon className="h-4 w-4" />
                )}
              </div>

              <div className="flex-1 pt-0.5">
                {item.title && (
                  <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    {item.title}
                  </h4>
                )}
                <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-300">
                  {item.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() => removeToast(item.id)}
                className="rounded-lg p-1 text-stone-400 transition hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-200"
                aria-label="Dismiss toast"
              >
                ✕
              </button>
            </div>
          )
        })}
      </div>

      {/* ─── Custom Confirmation Popup (Restora Themed) ─────────────── */}
      {confirmState && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs transition-opacity duration-200"
          onClick={() => handleConfirmAction(false)}
        >
          <div
            className="w-full max-w-md transform rounded-3xl border border-stone-200 bg-white p-7 shadow-2xl transition-all dark:border-stone-800 dark:bg-stone-900"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                  confirmState.variant === 'danger'
                    ? 'bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400'
                    : 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                }`}
              >
                {confirmState.variant === 'danger' ? (
                  <AlertTriangleIcon className="h-6 w-6" />
                ) : (
                  <span className="text-xl">✧</span>
                )}
              </div>

              <div className="flex-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
                  Confirmation Needed
                </span>
                <h3
                  id="confirm-dialog-title"
                  className="mt-1 font-serif text-xl font-medium text-stone-900 dark:text-stone-100"
                >
                  {confirmState.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-stone-600 dark:text-stone-400">
                  {confirmState.message}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-stone-100 pt-5 dark:border-stone-800/80">
              <button
                type="button"
                onClick={() => handleConfirmAction(false)}
                className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-semibold text-stone-700 transition hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-400/20 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
              >
                {confirmState.cancelText}
              </button>
              <button
                type="button"
                onClick={() => handleConfirmAction(true)}
                autoFocus
                className={`rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-md transition focus:outline-none focus:ring-2 ${
                  confirmState.variant === 'danger'
                    ? 'bg-red-600 shadow-red-600/20 hover:bg-red-700 focus:ring-red-500/30'
                    : 'bg-amber-500 shadow-amber-500/20 hover:bg-amber-600 focus:ring-amber-500/30'
                }`}
              >
                {confirmState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  )
}

