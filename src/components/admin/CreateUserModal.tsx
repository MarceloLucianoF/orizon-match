import { useState } from "react";
import { X, UserPlus, KeyRound, Loader2, Mail, BadgeCheck, Copy, Check } from "lucide-react";
import { adminCreateUserAPI } from "../../services/adminService";
import { useTranslation } from "react-i18next";

interface CreateUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateUserModal({ onClose, onSuccess }: CreateUserModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "inventor",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const roles = [
    { id: "inventor", label: t("dashboard.admin.roles.inventor") },
    { id: "industry", label: t("dashboard.admin.roles.industry") },
    { id: "ict", label: t("dashboard.admin.roles.ict") },
    { id: "investor", label: t("dashboard.admin.roles.investor") },
    { id: "admin", label: t("dashboard.admin.roles.admin") },
  ];

  const handleGeneratePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let newPassword = "";
    for (let i = 0; i < 12; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: newPassword }));
  };

  const handleCopyPassword = () => {
    if (formData.password) {
      navigator.clipboard.writeText(formData.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (formData.password.length < 6) {
      setError(t("dashboard.admin.createUserModal.passwordMinLength"));
      setLoading(false);
      return;
    }

    try {
      await adminCreateUserAPI({
        email: formData.email,
        password: formData.password,
        displayName: formData.name || t("dashboard.admin.createUserModal.newUserName"),
        role: formData.role,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || t("dashboard.admin.createUserModal.errorCreateUser"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-[#0A0514] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20 text-teal-400">
              <UserPlus size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">{t("dashboard.admin.createUserModal.title")}</h2>
              <p className="text-xs text-slate-400">{t("dashboard.admin.createUserModal.subtitle")}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-slate-200 transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          <form id="create-user-form" onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{t("dashboard.admin.createUserModal.fullName")}</label>
              <div className="relative">
                <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder={t("dashboard.admin.createUserModal.placeholderName")}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{t("dashboard.admin.createUserModal.email")}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                  placeholder="email@empresa.com"
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{t("dashboard.admin.createUserModal.accessLevel")}</label>
              <select 
                value={formData.role}
                onChange={(e) => setFormData(p => ({ ...p, role: e.target.value }))}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all appearance-none cursor-pointer"
              >
                {roles.map(r => (
                  <option key={r.id} value={r.id} className="bg-slate-900 text-slate-200">
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t("dashboard.admin.createUserModal.password")}</label>
                <button 
                  type="button"
                  onClick={handleGeneratePassword}
                  className="text-[10px] text-teal-400 font-bold hover:text-teal-300 transition-colors uppercase tracking-widest"
                >
                  {t("dashboard.admin.createUserModal.generateRandom")}
                </button>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="text" 
                  required
                  value={formData.password}
                  onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
                  placeholder={t("dashboard.admin.createUserModal.passwordPlaceholder")}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 pl-10 pr-12 text-sm text-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  title="Copiar senha"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 rounded-lg transition-colors"
                >
                  {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                </button>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/60 bg-slate-900/50 flex items-center justify-end gap-3">
          <button 
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {t("dashboard.admin.createUserModal.cancel")}
          </button>
          <button 
            type="submit"
            form="create-user-form"
            disabled={loading || !formData.email || !formData.password}
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-teal-600 hover:bg-teal-500 text-white shadow-[0_0_20px_rgba(0,181,156,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 min-w-[140px]"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : t("dashboard.admin.createUserModal.saveUser")}
          </button>
        </div>

      </div>
    </div>
  );
}
