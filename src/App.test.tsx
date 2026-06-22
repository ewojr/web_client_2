import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import '@/i18n'
import App from '@/App'

function renderApp() {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>,
  )
}

describe('App', () => {
  it('renders the login page by default', async () => {
    window.history.pushState({}, '', '/login')
    renderApp()
    // LoginPage is now lazy-loaded, so the assertion has to await mount.
    expect(await screen.findByText('Sign in to Password Depot Server')).toBeInTheDocument()
  })
})
