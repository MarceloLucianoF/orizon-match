import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { AlertOctagon, RotateCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
    
    // Simulating structured logging to a backend logging service/Sentry
    const correlationId = `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    console.warn(`[Structured Log] Correlation ID: ${correlationId} | Message: ${error.message}`);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-slate-900 border border-red-500/20 rounded-3xl p-8 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              <AlertOctagon size={32} />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">Oops! Algo deu errado.</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ocorreu um erro inesperado na renderização desta página. Nossos engenheiros foram notificados.
              </p>
            </div>

            {/* Error Details in Development Mode */}
            {import.meta.env.DEV && this.state.error && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-left overflow-x-auto text-[10px] font-mono text-red-400 max-h-40 custom-scrollbar space-y-1">
                <p className="font-bold">{this.state.error.toString()}</p>
                {this.state.errorInfo && (
                  <pre className="text-slate-600 whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-teal-650 hover:bg-teal-600 text-white py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border border-teal-500/30 shadow-[0_0_15px_rgba(0,181,156,0.2)]"
              >
                <RotateCw size={14} /> Recarregar App
              </button>
              <button
                onClick={() => {
                  window.location.href = "/";
                }}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border border-slate-700"
              >
                <Home size={14} /> Voltar ao Início
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
