import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary capturou um erro:", error, errorInfo);
  }

  handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto mt-10 w-full max-w-2xl rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-500/30 dark:bg-rose-500/10">
          <h1 className="text-2xl font-semibold text-rose-700 dark:text-rose-200">
            Ops! Algo inesperado aconteceu.
          </h1>
          <p className="mt-3 text-sm text-rose-700/90 dark:text-rose-100/90">
            Nao se preocupe. O incidente foi capturado e podemos continuar de onde parou.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <a
              href="/"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white"
            >
              Voltar para home
            </a>
            <button
              type="button"
              onClick={this.handleReload}
              className="rounded-xl border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-500/30 dark:text-rose-100 dark:hover:bg-rose-500/20"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
