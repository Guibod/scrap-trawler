import React from "react"
import errorImage from "data-base64:~/../assets/error.png"

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div aria-label="Error" className="flex flex-col items-center justify-center h-full text-center p-8">
          <img
            src={errorImage}
            alt="Something broke"
            className="w-32 h-32 mb-4"
          />
          <h1 className="text-xl font-bold text-red-600">Something went wrong.</h1>
          <p className="text-sm text-gray-400">Try reloading or report the issue if it persists.</p>
        </div>
      )
    }

    return this.props.children
  }
}
