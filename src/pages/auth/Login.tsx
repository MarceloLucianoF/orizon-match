import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Loader2, ArrowLeft, ShieldCheck, Lock } from "lucide-react";
import { Link } from "react-router-dom";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { login, loginWithGoogle } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError("Credenciais inválidas. Verifique seu e-mail e senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.08),transparent_50%)] flex items-center justify-center p-4 font-sans text-slate-200">
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-[2rem] p-8 md:p-10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/[0.02] blur-[80px] pointer-events-none" />
        
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-3 group/logo">
            <span className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-black shadow-[0_0_15px_rgba(79,70,229,0.5)] group-hover/logo:scale-105 group-hover/logo:rotate-3 transition-all duration-300">O</span>
            <span className="text-xl font-black text-white tracking-tight">Orizon</span>
          </Link>
          <h2 className="text-lg font-bold text-white tracking-tight">Entrar na plataforma</h2>
          <p className="text-slate-400 mt-1 text-xs">Insira suas credenciais para acessar os matches</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs mb-6 animate-in fade-in zoom-in-95">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 hover:border-slate-700/60 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm placeholder:text-slate-600"
              placeholder="seu@email.com"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Senha</label>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 hover:border-slate-700/60 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm placeholder:text-slate-600"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl py-3 font-bold transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <>Acessar Ecossistema <Lock size={14} /></>}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-slate-800/80" />
          <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">ou</span>
          <div className="flex-1 h-px bg-slate-800/80" />
        </div>

        <button
          onClick={async () => {
            setError("");
            try {
              await loginWithGoogle();
              navigate("/dashboard");
            } catch (err: any) {
              setError("Erro ao entrar com Google. Tente novamente.");
            }
          }}
          className="w-full bg-slate-950/45 hover:bg-slate-900 text-slate-350 hover:text-white rounded-xl py-3 font-semibold transition-all border border-slate-800 hover:border-slate-700 flex items-center justify-center gap-3 text-sm hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
        >
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google
        </button>

        <div className="mt-6 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-3 shadow-inner group/disclaimer transition-colors duration-300 hover:border-indigo-500/20">
          <ShieldCheck size={18} className="text-emerald-400 shrink-0 mt-0.5 group-hover/disclaimer:scale-105 group-hover/disclaimer:text-emerald-300 transition-all duration-300" />
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Seus dados são protegidos por criptografia militar de ponta a ponta. As negociações ocorrem em ambiente seguro e sob acordos automáticos de NDA.
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col gap-4">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 text-xs text-slate-450 hover:text-slate-200 transition-colors duration-200"
          >
            <ArrowLeft size={14} /> Voltar para Home
          </Link>
          
          <div className="text-center text-xs text-slate-500">
            Não tem uma conta?{" "}
            <Link to="/onboarding" className="text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-4 decoration-indigo-500/30 hover:decoration-indigo-500 transition-all">
              Começar agora
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

