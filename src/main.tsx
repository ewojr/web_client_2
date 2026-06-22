import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/lib/queryClient'
import { loadConfig } from '@/lib/config'
import { setupApiBindings } from '@/lib/apiBindings'
import { TooltipProvider } from '@/components/ui/tooltip'
import '@/i18n'
import '@/index.css'
import App from '@/App'

// Microsoft Entra ID returns id_tokens in the URL fragment (response_mode=
// fragment), but this app uses HashRouter, which would interpret that
// fragment as a (broken) route. Capture the IdP payload before HashRouter
// mounts, stash it in sessionStorage for the LoginForm to consume, then
// rewrite the URL hash to '#/login' so HashRouter routes normally.
function captureOidcFragment(): void {
  const rawHash = window.location.hash.replace(/^#/, '')
  if (!rawHash) return
  const params = new URLSearchParams(rawHash)
  const isOidcCallback =
    params.has('id_token') || params.has('code') || params.has('error')
  if (!isOidcCallback) return
  sessionStorage.setItem('pd-oidc-fragment', rawHash)
  window.history.replaceState(
    null,
    '',
    `${window.location.pathname}${window.location.search}#/login`,
  )
}

loadConfig().then(() => {
  // Wire api/ → stores/ bridge before any component can fire a request.
  setupApiBindings()
  captureOidcFragment()
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <HashRouter>
            <App />
          </HashRouter>
        </TooltipProvider>
        {/* Dev-only: the package lives in devDependencies and is dead-code-
            eliminated from the production bundle by this compile-time guard. */}
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </StrictMode>,
  )
})
