import { Component, type ReactNode, type ErrorInfo } from 'react'
import i18next from 'i18next'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-8">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <h1 className="text-xl font-semibold">{i18next.t('errors.boundaryTitle')}</h1>
          <p className="max-w-md text-center text-sm text-muted-foreground">
            {this.state.error?.message}
          </p>
          <Button onClick={() => this.setState({ hasError: false, error: null })}>
            {i18next.t('common.tryAgain')}
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
