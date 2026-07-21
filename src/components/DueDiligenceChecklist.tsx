import { useState, useEffect } from "react";
import { 
  CheckCircle2, Circle, ShieldCheck, 
  AlertCircle, ArrowRight, Activity, Loader2
} from "lucide-react";
import { doc, collection, onSnapshot, setDoc, updateDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../hooks/useAuth";
import { notifyStakeholdersOnVdrCompletion } from "../services/notificationService";
import { logAudit, logActivity } from "../services/governanceService";

interface ChecklistItem {
  id: string;
  label: string;
  category: 'pi' | 'finance' | 'legal' | 'team';
  isCompleted: boolean;
  isRequired: boolean;
  status: 'pending' | 'completed';
  responsavel: string;
  observacao: string;
  data: any;
}

export function DueDiligenceChecklist({ projectId, projectTitle }: { projectId?: string; projectTitle?: string }) {
  const { user } = useAuth();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasNotified, setHasNotified] = useState(false);

  const defaultItems: Omit<ChecklistItem, 'data'>[] = [
    { id: '1', label: 'Certificado de Depósito de Patente', category: 'pi', isCompleted: true, isRequired: true, status: 'completed', responsavel: 'Sistema', observacao: 'Importado do INPI' },
    { id: '2', label: 'Análise de Anterioridade Validada', category: 'pi', isCompleted: false, isRequired: true, status: 'pending', responsavel: '', observacao: '' },
    { id: '3', label: 'Projeção Financeira (3 anos)', category: 'finance', isCompleted: false, isRequired: true, status: 'pending', responsavel: '', observacao: '' },
    { id: '4', label: 'Pitch Deck Atualizado', category: 'finance', isCompleted: true, isRequired: true, status: 'completed', responsavel: 'Sistema', observacao: 'Carregado no VDR' },
    { id: '5', label: 'Estatuto Social / Contrato Social', category: 'legal', isCompleted: true, isRequired: false, status: 'completed', responsavel: 'Sistema', observacao: 'Padrão' },
    { id: '6', label: 'Currículo Lattes/LinkedIn Fundadores', category: 'team', isCompleted: false, isRequired: true, status: 'pending', responsavel: '', observacao: '' },
  ];

  // 1. Real-time checklist sync
  useEffect(() => {
    if (!projectId) return;

    setLoading(true);
    const checklistRef = collection(db, "projects", projectId, "due_diligence");
    
    const unsubscribe = onSnapshot(checklistRef, async (snapshot) => {
      let list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChecklistItem[];

      // If empty, initialize database with default checklist items
      if (list.length === 0) {
        try {
          await Promise.all(
            defaultItems.map(item => {
              const itemRef = doc(db, "projects", projectId, "due_diligence", item.id);
              return setDoc(itemRef, {
                ...item,
                data: new Date()
              });
            })
          );
        } catch (err) {
          console.error("Erro ao inicializar checklist de due diligence:", err);
        }
      } else {
        // Sort items by ID to keep the layout predictable
        list.sort((a, b) => parseInt(a.id) - parseInt(b.id));
        setItems(list);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [projectId]);

  // Calculate statistics
  const progress = items.length > 0 
    ? Math.round((items.filter(i => i.isCompleted).length / items.length) * 100) 
    : 0;
  
  const requiredCompleted = items.filter(i => i.isRequired && i.isCompleted).length;
  const totalRequired = items.filter(i => i.isRequired).length;
  const isReady = items.length > 0 && requiredCompleted === totalRequired;

  // 2. Trigger notification via useEffect to prevent render cycles
  useEffect(() => {
    if (isReady && !hasNotified && projectId) {
      setHasNotified(true);
      notifyStakeholdersOnVdrCompletion(projectId, projectTitle || "Projeto");
    } else if (!isReady) {
      setHasNotified(false);
    }
  }, [isReady, hasNotified, projectId, projectTitle]);

  const toggleItem = async (itemId: string) => {
    if (!projectId || !user || loading) return;
    const toggledItem = items.find(i => i.id === itemId);
    if (!toggledItem) return;

    const nextIsCompleted = !toggledItem.isCompleted;
    
    // Optimistic local state update
    const updatedItems = items.map(item => 
      item.id === itemId ? { ...item, isCompleted: nextIsCompleted } : item
    );
    setItems(updatedItems);

    const nextProgress = Math.round((updatedItems.filter(i => i.isCompleted).length / updatedItems.length) * 100);
    const nextRequiredCompleted = updatedItems.filter(i => i.isRequired && i.isCompleted).length;
    const nextTotalRequired = updatedItems.filter(i => i.isRequired).length;
    const nextIsVdrReady = nextRequiredCompleted === nextTotalRequired;

    try {
      // 1. Update subcollection document
      const itemRef = doc(db, "projects", projectId, "due_diligence", itemId);
      await setDoc(itemRef, {
        isCompleted: nextIsCompleted,
        status: nextIsCompleted ? 'completed' : 'pending',
        responsavel: user.displayName || user.email || 'Membro do Time',
        data: new Date()
      }, { merge: true });

      // 2. Update parent document progress stats
      const projectRef = doc(db, "projects", projectId);
      await updateDoc(projectRef, {
        dueDiligenceProgress: nextProgress,
        isVdrReady: nextIsVdrReady
      });

      // 3. Registrar na Governança
      const actor = {
        uid: user.uid,
        name: user.displayName || user.email || 'Membro do Time',
        email: user.email || '',
        role: 'inventor'
      };

      await logAudit(
        actor,
        "project.due_diligence.toggle",
        projectId,
        projectTitle || "Projeto",
        { itemId, label: toggledItem.label, isCompleted: toggledItem.isCompleted },
        { itemId, label: toggledItem.label, isCompleted: nextIsCompleted }
      );

      await logActivity(
        "project.due_diligence.updated",
        actor.name,
        projectId,
        projectTitle || "Projeto",
        { itemId, label: toggledItem.label, isCompleted: nextIsCompleted }
      );
    } catch (err) {
      console.error("Erro ao atualizar item do checklist:", err);
      // Revert optimistic update on failure
      loadBackupItems();
    }
  };

  const loadBackupItems = async () => {
    if (!projectId) return;
    const snapshot = await getDocs(collection(db, "projects", projectId, "due_diligence"));
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ChecklistItem[];
    list.sort((a, b) => parseInt(a.id) - parseInt(b.id));
    setItems(list);
  };

  if (loading) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 flex justify-center items-center py-12">
        <Loader2 className="animate-spin text-teal-400" size={24} />
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 uppercase tracking-widest">
            <ShieldCheck className="text-emerald-400" size={16} /> Checklist de Due Diligence
          </h3>
          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-tight">Status de auditoria jurídica e técnica</p>
        </div>
        <div className="text-right">
          <span className={`text-xl font-black ${isReady ? 'text-emerald-400' : 'text-teal-400'}`}>{progress}%</span>
          <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${isReady ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-teal-500'}`} 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {items.map(item => (
          <div 
            key={item.id} 
            onClick={() => toggleItem(item.id)}
            className={`group flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
              item.isCompleted 
              ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-300' 
              : 'bg-slate-950/50 border-slate-800 text-slate-500 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              {item.isCompleted ? (
                <CheckCircle2 className="text-emerald-400" size={18} />
              ) : (
                <Circle className="text-slate-700 group-hover:text-slate-500" size={18} />
              )}
              <span className={`text-xs font-medium ${item.isCompleted ? 'text-slate-200' : ''}`}>
                {item.label}
                {item.isRequired && !item.isCompleted && (
                  <span className="ml-2 text-[9px] text-amber-500 font-bold uppercase">Obrigatório</span>
                )}
                {item.isCompleted && item.responsavel && (
                  <span className="ml-2 text-[9px] text-slate-500 font-mono">({item.responsavel})</span>
                )}
              </span>
            </div>
            <div className={`w-2 h-2 rounded-full ${
              item.category === 'pi' ? 'bg-teal-500' : 
              item.category === 'finance' ? 'bg-amber-500' : 
              item.category === 'legal' ? 'bg-emerald-500' : 'bg-cyan-500'
            } opacity-40`} />
          </div>
        ))}
      </div>

      {isReady ? (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4 animate-in zoom-in-95">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-400">Projeto Apto para Investimento</p>
            <p className="text-[10px] text-emerald-500/70">Toda a documentação obrigatória foi validada.</p>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-slate-500" size={18} />
            <span className="text-[10px] text-slate-400 font-bold uppercase">Aguardando auditoria jurídica</span>
          </div>
          <button className="text-[10px] font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1 uppercase tracking-widest">
            Convidar Especialista <ArrowRight size={10} />
          </button>
        </div>
      )}
    </div>
  );
}
