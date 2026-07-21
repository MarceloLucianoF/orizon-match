import { useState, useEffect, useRef } from "react";
import { 
  FolderOpen, FileText, Lock, 
  ShieldCheck, Upload, Download, 
  ChevronRight, Eye, FileBadge, 
  Briefcase, TrendingUp,
  Loader2, ClipboardList, Clock, Info
} from "lucide-react";
import { SecureNDA } from "./SecureNDA";
import { useAuth } from "../hooks/useAuth";
import { 
  collection, query, getDocs, addDoc, 
  serverTimestamp
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase/config";
import { checkExistingNDA } from "../services/ndaService";
import { useTranslation } from "react-i18next";
import { logAudit, logActivity } from "../services/governanceService";

interface VDRFile {
  id: string;
  name: string;
  type: string;
  size: string;
  status: 'pending' | 'verified' | 'rejected';
  lastModified: string;
  downloadUrl: string;
  uploadedBy: string;
  uploadedAt: any;
  version: string;
  category: 'pi' | 'finance' | 'legal' | 'scientific' | 'pitch';
  accessLevel: 'public' | 'restricted';
}

interface AuditLog {
  id: string;
  fileId: string;
  fileName: string;
  action: 'view' | 'download' | 'upload';
  userId: string;
  userName: string;
  timestamp: any;
}

export function VDRRoom({ 
  projectId, 
  projectTitle,
  isPublic = false, 
  inpiStatus 
}: { 
  projectId?: string; 
  projectTitle?: string;
  isPublic?: boolean; 
  inpiStatus?: string;
}) {
  const { user, userProfile } = useAuth();
  const { t } = useTranslation();
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [hasSignedNDA, setHasSignedNDA] = useState(false);
  const [showNDAModal, setShowNDAModal] = useState(false);
  const [checkingNDA, setCheckingNDA] = useState(true);
  const [files, setFiles] = useState<VDRFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);

  // States for VDR Cleanroom Secure Viewer
  const [viewerFile, setViewerFile] = useState<VDRFile | null>(null);
  const [viewerStartTime, setViewerStartTime] = useState<number | null>(null);
  const [viewerIp, setViewerIp] = useState<string>("127.0.0.1");

  useEffect(() => {
    async function fetchIp() {
      try {
        const res = await fetch("https://api.ipify.org?format=json");
        const data = await res.json();
        if (data.ip) setViewerIp(data.ip);
      } catch (err) {
        console.error("Erro ao obter IP para VDR:", err);
      }
    }
    fetchIp();
  }, []);

  const getSessionId = () => {
    let sid = sessionStorage.getItem("inovahelix_session_id");
    if (!sid) {
      sid = "sess_" + Math.random().toString(36).substring(2, 15) + "_" + Date.now();
      sessionStorage.setItem("inovahelix_session_id", sid);
    }
    return sid;
  };
  
  // State for Upload Modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState<'pi' | 'finance' | 'legal' | 'scientific' | 'pitch'>('pitch');
  const [uploadAccessLevel, setUploadAccessLevel] = useState<'public' | 'restricted'>('restricted');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [showAuditLogs, setShowAuditLogs] = useState(false);

  // Default mock fallback files (in case DB is empty, ensuring a rich initial UI)
  const defaultFiles: Omit<VDRFile, 'id' | 'downloadUrl'>[] = [
    { name: 'Relatorio_Anterioridade_INPI.pdf', type: 'PDF', size: '1.2 MB', status: 'verified', lastModified: '12/05/2024', uploadedBy: 'Sistema', uploadedAt: new Date(), version: '1.0', category: 'pi', accessLevel: 'public' },
    { name: 'Certificado_Deposito_Patente.pdf', type: 'PDF', size: '450 KB', status: 'verified', lastModified: '10/05/2024', uploadedBy: 'Sistema', uploadedAt: new Date(), version: '1.0', category: 'pi', accessLevel: 'public' },
    { name: 'Projecao_Financeira_2024_2027.xlsx', type: 'XLSX', size: '2.4 MB', status: 'verified', lastModified: '08/05/2024', uploadedBy: 'Sistema', uploadedAt: new Date(), version: '1.0', category: 'finance', accessLevel: 'restricted' },
    { name: 'Plano_de_Negocios_Resumido.pdf', type: 'PDF', size: '3.1 MB', status: 'verified', lastModified: '05/05/2024', uploadedBy: 'Sistema', uploadedAt: new Date(), version: '1.0', category: 'finance', accessLevel: 'restricted' },
    { name: 'Estatuto_Social_InovaHelix.pdf', type: 'PDF', size: '1.8 MB', status: 'verified', lastModified: '01/05/2024', uploadedBy: 'Sistema', uploadedAt: new Date(), version: '1.0', category: 'legal', accessLevel: 'restricted' },
    { name: 'Acordo_de_Confidencialidade_Padrao.pdf', type: 'PDF', size: '890 KB', status: 'verified', lastModified: '28/04/2024', uploadedBy: 'Sistema', uploadedAt: new Date(), version: '1.0', category: 'legal', accessLevel: 'restricted' },
    { name: 'Laudo_Laboratorial_Homologado.pdf', type: 'PDF', size: '3.8 MB', status: 'verified', lastModified: '18/05/2024', uploadedBy: 'Sistema', uploadedAt: new Date(), version: '1.0', category: 'scientific', accessLevel: 'restricted' },
    { name: 'Relatorio_Testes_Industriais_Fase_Piloto.pdf', type: 'PDF', size: '4.5 MB', status: 'verified', lastModified: '20/05/2024', uploadedBy: 'Sistema', uploadedAt: new Date(), version: '1.0', category: 'scientific', accessLevel: 'restricted' },
    { name: 'InovaHelix_Pitch_Deck_V3.pdf', type: 'PDF', size: '5.2 MB', status: 'verified', lastModified: '15/05/2024', uploadedBy: 'Sistema', uploadedAt: new Date(), version: '1.0', category: 'pitch', accessLevel: 'public' },
    { name: 'Video_Demonstracao_MVP.mp4', type: 'MP4', size: '45 MB', status: 'pending', lastModified: '14/05/2024', uploadedBy: 'Sistema', uploadedAt: new Date(), version: '1.0', category: 'pitch', accessLevel: 'public' }
  ];

  // 1. Verify NDA Status
  useEffect(() => {
    async function verifyNDA() {
      if (!user || !projectId) {
        setCheckingNDA(false);
        return;
      }
      try {
        const signed = await checkExistingNDA(user.uid, projectId);
        setHasSignedNDA(signed);
      } catch (err) {
        console.error("Erro ao verificar NDA", err);
      } finally {
        setCheckingNDA(false);
      }
    }
    verifyNDA();
  }, [user, projectId, showNDAModal]);

  // 2. Load Files from Firestore Subcollection
  const loadFiles = async () => {
    if (!projectId) return;
    setLoadingFiles(true);
    try {
      const q = query(collection(db, "projects", projectId, "vdr_files"));
      const snap = await getDocs(q);
      const loaded = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as VDRFile[];

      if (loaded.length === 0) {
        // If Firestore is empty, we show the default structured files
        const mappedDefaults = defaultFiles.map((df, index) => ({
          ...df,
          id: `default_${index}`,
          downloadUrl: "#" // Fallback local link
        })) as VDRFile[];
        setFiles(mappedDefaults);
      } else {
        setFiles(loaded);
      }
    } catch (err) {
      console.error("Erro ao carregar arquivos VDR", err);
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [projectId]);

  // 3. Load Audit Logs (Only for Owner/Admin)
  const loadAuditLogs = async () => {
    if (!projectId) return;
    setLoadingLogs(true);
    try {
      const q = query(collection(db, "projects", projectId, "vdr_logs"));
      const snap = await getDocs(q);
      const logs = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as AuditLog[];
      
      // Sort logs by timestamp (descending)
      logs.sort((a, b) => {
        const timeA = a.timestamp?.seconds || 0;
        const timeB = b.timestamp?.seconds || 0;
        return timeB - timeA;
      });
      
      setAuditLogs(logs);
    } catch (err) {
      console.error("Erro ao carregar logs de auditoria", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (showAuditLogs) {
      loadAuditLogs();
    }
  }, [showAuditLogs, projectId]);

  // 4. Log Access Event
  const logAccess = async (file: VDRFile, action: 'view' | 'download') => {
    if (!projectId || !user) return;
    try {
      await addDoc(collection(db, "projects", projectId, "vdr_logs"), {
        fileId: file.id,
        fileName: file.name,
        action,
        userId: user.uid,
        userName: user.displayName || user.email || "Usuário",
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.error("Erro ao registrar log de acesso VDR", err);
    }
  };

  // 5. File Upload Handler
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !user || !uploadFile) return;

    setUploading(true);
    try {
      // Version calculation
      const existingSameName = files.filter(f => f.name === uploadFile.name);
      let newVersion = "1.0";
      if (existingSameName.length > 0) {
        const latestVersion = Math.max(...existingSameName.map(f => parseFloat(f.version || "1.0")));
        newVersion = (latestVersion + 1.0).toFixed(1);
      }

      // Upload file to Firebase Storage
      const storagePath = `projects/${projectId}/vdr/${uploadCategory}/${Date.now()}_${uploadFile.name}`;
      const storageRef = ref(storage, storagePath);
      
      await uploadBytes(storageRef, uploadFile);
      const downloadUrl = await getDownloadURL(storageRef);

      // Save metadata to Firestore subcollection
      const sizeMB = (uploadFile.size / (1024 * 1024)).toFixed(2) + " MB";
      const fileExt = uploadFile.name.split('.').pop()?.toUpperCase() || "DOC";

      const fileData: Omit<VDRFile, 'id'> = {
        name: uploadFile.name,
        type: fileExt,
        size: sizeMB,
        status: 'verified',
        lastModified: new Date().toLocaleDateString('pt-BR'),
        downloadUrl,
        uploadedBy: user.displayName || user.email || "Membro da Equipe",
        uploadedAt: new Date(),
        version: newVersion,
        category: uploadCategory,
        accessLevel: uploadAccessLevel
      };

      const fileDocRef = await addDoc(collection(db, "projects", projectId, "vdr_files"), fileData);
      
      // Log upload action
      await addDoc(collection(db, "projects", projectId, "vdr_logs"), {
        fileId: fileDocRef.id,
        fileName: uploadFile.name,
        action: 'upload',
        userId: user.uid,
        userName: user.displayName || user.email || "Membro da Equipe",
        timestamp: serverTimestamp()
      });

      const actor = {
        uid: user.uid,
        name: user.displayName || user.email || "Membro da Equipe",
        email: user.email || "",
        role: userProfile?.role || "ict"
      };

      await logAudit(
        actor,
        "file.upload",
        projectId,
        projectTitle || "Projeto",
        null,
        { fileId: fileDocRef.id, fileName: uploadFile.name, category: uploadCategory }
      );

      await logActivity(
        "vdr.file.uploaded",
        actor.name,
        projectId,
        projectTitle || "Projeto",
        { fileName: uploadFile.name, category: uploadCategory }
      );

      // Cleanup & Refresh
      setUploadFile(null);
      setShowUploadModal(false);
      await loadFiles();
    } catch (err) {
      console.error("Falha ao subir arquivo VDR", err);
      alert("Falha no upload do arquivo. Verifique as configurações de rede e permissões.");
    } finally {
      setUploading(false);
    }
  };

  const inpiBadge = inpiStatus ? {
    'depositada': { label: 'Patente Depositada', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    'concedida': { label: 'Patente Concedida', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    'expirada': { label: 'Patente Expirada', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  }[inpiStatus.toLowerCase()] || { label: `INPI: ${inpiStatus}`, color: 'bg-slate-800 text-slate-400 border-slate-700' } : null;

  // Folder Definitions
  const folders = [
    { id: 'pi', name: t("vdr.folder.pi"), icon: ShieldCheck, isLocked: false },
    { id: 'finance', name: t("vdr.folder.finance"), icon: TrendingUp, isLocked: isPublic && (checkingNDA ? true : !hasSignedNDA) },
    { id: 'legal', name: t("vdr.folder.legal"), icon: Briefcase, isLocked: isPublic && (checkingNDA ? true : !hasSignedNDA) },
    { id: 'scientific', name: t("vdr.folder.scientific"), icon: FileText, isLocked: isPublic && (checkingNDA ? true : !hasSignedNDA) },
    { id: 'pitch', name: t("vdr.folder.pitch"), icon: FileBadge, isLocked: false }
  ];

  const currentFolder = folders.find(f => f.id === activeFolder);
  const activeFolderFiles = files.filter(file => file.category === activeFolder);

  const handleDownloadFile = async (file: VDRFile) => {
    const actor = {
      uid: user?.uid || "",
      name: user?.displayName || user?.email || "Usuário VDR",
      email: user?.email || "",
      role: userProfile?.role || "visitor"
    };

    await logAudit(
      actor,
      "file.download",
      projectId || null,
      projectTitle || null,
      null,
      { fileId: file.id, fileName: file.name, category: file.category }
    );

    await logAccess(file, 'download');

    if (file.downloadUrl && file.downloadUrl !== "#") {
      window.open(file.downloadUrl, "_blank");
    } else {
      // Fallback for mock items
      alert(`[Modo Simulação] Download simulado de ${file.name}.`);
    }
  };

  const handleViewFile = async (file: VDRFile) => {
    const startTime = Date.now();
    setViewerFile(file);
    setViewerStartTime(startTime);

    const actor = {
      uid: user?.uid || "",
      name: user?.displayName || user?.email || "Usuário VDR",
      email: user?.email || "",
      role: userProfile?.role || "visitor"
    };

    await logAudit(
      actor,
      "file.view.start",
      projectId || null,
      projectTitle || null,
      null,
      { fileId: file.id, fileName: file.name, category: file.category }
    );

    await logAccess(file, 'view');
  };

  const handleCloseViewer = async () => {
    if (!viewerFile || !viewerStartTime) {
      setViewerFile(null);
      setViewerStartTime(null);
      return;
    }

    const duration = Math.round((Date.now() - viewerStartTime) / 1000);

    const actor = {
      uid: user?.uid || "",
      name: user?.displayName || user?.email || "Usuário VDR",
      email: user?.email || "",
      role: userProfile?.role || "visitor"
    };

    await logAudit(
      actor,
      "file.view.end",
      projectId || null,
      projectTitle || null,
      null,
      { 
        fileId: viewerFile.id, 
        fileName: viewerFile.name, 
        category: viewerFile.category,
        durationSeconds: duration
      }
    );

    setViewerFile(null);
    setViewerStartTime(null);
  };

  const handlePrintAttempt = async () => {
    if (!viewerFile) return;

    const actor = {
      uid: user?.uid || "",
      name: user?.displayName || user?.email || "Usuário VDR",
      email: user?.email || "",
      role: userProfile?.role || "visitor"
    };

    await logAudit(
      actor,
      "file.print",
      projectId || null,
      projectTitle || null,
      null,
      { fileId: viewerFile.id, fileName: viewerFile.name }
    );

    alert("Aviso de Conformidade: Impressão bloqueada e registrada nos logs de auditoria.");
  };

  useEffect(() => {
    if (!viewerFile) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Ctrl+P / Cmd+P
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        handlePrintAttempt();
      }
      // Block Ctrl+S / Cmd+S
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        alert("Aviso de Conformidade: Download e salvamento de arquivos a partir do visualizador seguro são bloqueados.");
      }
      // Block Ctrl+C / Cmd+C
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        alert("Aviso de Conformidade: Cópia de texto bloqueada no visualizador seguro.");
      }
    };

    const handleBeforePrint = () => {
      handlePrintAttempt();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('beforeprint', handleBeforePrint);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeprint', handleBeforePrint);
    };
  }, [viewerFile, viewerStartTime]);

  return (
    <div className="bg-[#020617] bg-[radial-gradient(circle_at_top,rgba(0,181,156,0.02),transparent_60%)] border border-slate-850 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col min-h-[600px] relative">
      
      {/* VDR Header */}
      <div className="p-6 border-b border-slate-850 bg-slate-950/60 backdrop-blur-md flex flex-wrap justify-between items-center gap-3">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <FolderOpen className="text-teal-400" size={20} /> Virtual Data Room (VDR)
            {inpiBadge && (
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ml-2 flex items-center gap-1 ${inpiBadge.color}`}>
                <ShieldCheck size={10} /> {inpiBadge.label}
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Ambiente seguro para compartilhamento de documentação estratégica.</p>
        </div>
        
        <div className="flex gap-2">
          {!isPublic && (
            <button 
              onClick={() => setShowAuditLogs(!showAuditLogs)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border active:scale-95 duration-200 ${
                showAuditLogs 
                  ? 'bg-teal-500/10 text-teal-400 border-teal-500/30' 
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <ClipboardList size={14} /> {showAuditLogs ? "Ver Arquivos" : "Logs de Auditoria"}
            </button>
          )}
          
          {!isPublic && (
            <button 
              onClick={() => setShowUploadModal(true)}
              className="bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(0,181,156,0.25)] hover:shadow-[0_0_20px_rgba(0,181,156,0.45)] active:scale-95 duration-200"
            >
              <Upload size={14} /> Subir Documento
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 min-h-0 flex-col md:flex-row">
        
        {/* Sidebar Folders */}
        {!showAuditLogs && (
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-850 p-4 space-y-1.5 overflow-y-auto">
            {folders.map(folder => (
              <button
                key={folder.id}
                onClick={() => setActiveFolder(folder.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 border ${
                  activeFolder === folder.id 
                  ? 'bg-teal-500/10 text-teal-400 border-teal-500/20 shadow-[0_4px_15px_rgba(0,181,156,0.05)] font-bold' 
                  : 'text-slate-450 hover:bg-slate-900/40 hover:text-slate-200 border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <folder.icon size={18} className={activeFolder === folder.id ? 'text-teal-400' : 'text-slate-500'} />
                  <span className="text-sm font-medium">{folder.name}</span>
                </div>
                {folder.isLocked ? <Lock size={14} className="text-slate-650" /> : <ChevronRight size={14} className="text-slate-700" />}
              </button>
            ))}
          </div>
        )}

        {/* Dynamic Display Area */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-950/20 backdrop-blur-sm">
          {showAuditLogs ? (
            // Audit Log View
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-350 uppercase tracking-widest flex items-center gap-2">
                  <Clock size={16} className="text-teal-400" /> Histórico de Auditoria do VDR
                </h4>
                <span className="text-[10px] text-slate-500 font-bold uppercase">{auditLogs.length} Ações</span>
              </div>
              
              {loadingLogs ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="animate-spin text-teal-400" size={32} />
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="text-center py-12 text-slate-550 border border-dashed border-slate-800 rounded-2xl">
                  Nenhuma atividade registrada neste Virtual Data Room.
                </div>
              ) : (
                <div className="bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden shadow-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-850 text-[9px] uppercase font-bold text-slate-450 bg-slate-900/10 tracking-widest">
                        <th className="p-4">Usuário</th>
                        <th className="p-4">Documento</th>
                        <th className="p-4">Ação</th>
                        <th className="p-4">Data e Hora</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850/50 text-xs font-sans text-slate-300">
                      {auditLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-900/40 text-slate-300 transition-colors">
                          <td className="p-4 font-bold">{log.userName}</td>
                          <td className="p-4 text-slate-400">{log.fileName}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${
                              log.action === 'upload' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                              log.action === 'download' ? 'bg-teal-500/10 border-teal-500/20 text-teal-400' :
                              'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            }`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="p-4 text-slate-500">
                            {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString('pt-BR') : "Processando..."}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : !activeFolder ? (
            // Empty Folder State
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 animate-in fade-in duration-500 py-20">
              <FolderOpen size={48} className="opacity-20 text-teal-400" />
              <p className="text-xs">Selecione uma pasta para visualizar os arquivos confidenciais.</p>
            </div>
          ) : currentFolder?.isLocked ? (
            // Folder Locked State
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95 duration-300 py-16">
              <div className="w-20 h-20 rounded-full bg-slate-950 border border-slate-850 flex items-center justify-center shadow-lg">
                <Lock size={32} className="text-teal-500 animate-pulse" />
              </div>
              <div className="max-w-xs">
                <h4 className="text-slate-200 font-bold mb-2">Acesso Restrito</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Para visualizar os documentos confidenciais da pasta <strong>{currentFolder.name}</strong>, é necessário a assinatura do Acordo de Confidencialidade (NDA).
                </p>
              </div>
              <button 
                onClick={() => setShowNDAModal(true)}
                className="bg-teal-650 hover:bg-teal-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,181,156,0.3)] hover:shadow-[0_0_25px_rgba(0,181,156,0.5)] active:scale-95 transition-all duration-200"
              >
                Solicitar Acesso / Assinar NDA
              </button>
            </div>
          ) : (
            // Folder Active View
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-350 uppercase tracking-widest">{currentFolder?.name}</h4>
                <span className="text-[10px] text-slate-500 font-bold uppercase">{activeFolderFiles.length} Arquivos</span>
              </div>
              
              {loadingFiles ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="animate-spin text-teal-400" size={24} />
                </div>
              ) : activeFolderFiles.length === 0 ? (
                <div className="text-center py-12 text-slate-500 border border-dashed border-slate-850 rounded-2xl">
                  Nenhum documento nesta partição.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {activeFolderFiles.map(file => (
                    <div key={file.id} className="group bg-slate-950/40 border border-slate-850 hover:border-teal-500/30 hover:shadow-[0_4px_20px_rgba(20,184,166,0.05)] hover:scale-[1.005] rounded-xl p-4 flex items-center justify-between transition-all duration-300 backdrop-blur-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-center text-slate-450 group-hover:text-teal-400 transition-colors shadow-sm">
                          <FileText size={20} />
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-slate-200">{file.name}</h5>
                          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            <span className="text-[10px] text-slate-500 uppercase font-mono">{file.type} • {file.size}</span>
                            <span className="text-[10px] text-slate-500">v{file.version}</span>
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                              file.status === 'verified' ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' : 'bg-amber-500/10 border-amber-500/25 text-amber-400'
                            }`}>
                              {file.status === 'verified' ? <ShieldCheck size={10} /> : <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
                              {file.status === 'verified' ? 'Auditado' : 'Em Análise'}
                            </span>
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                              file.accessLevel === 'public' ? 'bg-teal-500/10 border-teal-500/25 text-teal-400' : 'bg-red-500/10 border-red-500/25 text-red-400'
                            }`}>
                              {file.accessLevel === 'public' ? 'Público' : 'Restrito (NDA)'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button 
                          onClick={() => handleViewFile(file)}
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all duration-205 active:scale-90 border border-transparent hover:border-slate-700/50" 
                          title="Visualizar"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleDownloadFile(file)}
                          className="p-2 text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 rounded-xl transition-all duration-205 active:scale-90 border border-transparent hover:border-teal-500/20" 
                          title="Baixar"
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* NDA Modal Clickwrap */}
      {showNDAModal && projectId && (
        <SecureNDA 
          projectId={projectId} 
          projectTitle={projectTitle || "Projeto"} 
          onAccept={() => {
            setHasSignedNDA(true);
            setShowNDAModal(false);
          }} 
        />
      )}

      {/* Document Upload Modal */}
      {showUploadModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md rounded-3xl">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Upload className="text-teal-400" size={24} /> Upload de Documento Seguro
            </h3>
            <p className="text-slate-400 text-xs mb-6">Insira um novo documento confidencial ou técnico no VDR do projeto.</p>

            <form onSubmit={handleUpload} className="space-y-4">
              {/* File Select */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-800 hover:border-teal-500/50 rounded-2xl p-6 text-center cursor-pointer transition bg-slate-950/40"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  required
                />
                <FileText size={32} className="mx-auto text-slate-605 mb-2" />
                <span className="text-xs font-bold text-slate-400">
                  {uploadFile ? uploadFile.name : "Clique para selecionar um arquivo"}
                </span>
                {uploadFile && (
                  <p className="text-[10px] text-slate-600 mt-1">
                    {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="text-slate-450 text-[9px] uppercase font-bold tracking-wider block mb-1.5">Categoria</label>
                <select 
                  value={uploadCategory} 
                  onChange={(e) => setUploadCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-teal-500"
                >
                  <option value="pi">Propriedade Intelectual (PI)</option>
                  <option value="finance">Financeiro / Negócios</option>
                  <option value="legal">Aspectos Jurídicos</option>
                  <option value="scientific">Relatórios Científicos/Testes</option>
                  <option value="pitch">Apresentação / Pitch</option>
                </select>
              </div>

              {/* Access Level */}
              <div>
                <label className="text-slate-450 text-[9px] uppercase font-bold tracking-wider block mb-1.5">Nível de Acesso</label>
                <select 
                  value={uploadAccessLevel} 
                  onChange={(e) => setUploadAccessLevel(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-teal-500"
                >
                  <option value="restricted">Restrito (Requer NDA assinado)</option>
                  <option value="public">Público (Visível para qualquer usuário)</option>
                </select>
              </div>

              {/* Alert note */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex gap-2 text-slate-400 text-[10px] leading-relaxed">
                <Info size={16} className="text-amber-400 shrink-0" />
                <span>O arquivo será versionado automaticamente caso já exista um documento com o mesmo nome neste VDR.</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setUploadFile(null);
                    setShowUploadModal(false);
                  }}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl text-xs font-bold transition active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadFile}
                  className="flex-1 bg-teal-600 hover:bg-teal-500 disabled:bg-teal-650/40 text-white py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 active:scale-95"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="animate-spin" size={14} /> Subindo...
                    </>
                  ) : "Confirmar Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VDR Cleanroom Secure Doc Viewer Modal */}
      {viewerFile && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-slate-950/90 backdrop-blur-md"
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-200">
            
            {/* Watermark Diagonal overlay */}
            <div className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-[0.07] z-40 flex flex-col justify-around rotate-[-25deg] scale-125">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="whitespace-nowrap text-[10px] font-mono font-black tracking-widest text-white flex justify-between gap-8 py-2">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <span key={j}>
                      SECURE DATA ROOM • {user?.email || "anonymous"} • IP: {viewerIp} • SESSION: {getSessionId().slice(0, 15)} • {new Date().toLocaleDateString('pt-BR')}
                    </span>
                  ))}
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="p-5 border-b border-slate-850 bg-slate-950/90 backdrop-blur-md flex justify-between items-center z-50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white tracking-tight flex items-center gap-2">
                    Visualizador Seguro VDR
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-black uppercase tracking-wider">
                      CONFIDENCIAL
                    </span>
                  </h4>
                  <p className="text-xs text-slate-550 mt-0.5">{viewerFile.name} (v{viewerFile.version})</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrintAttempt}
                  className="px-4 py-2 rounded-xl border border-slate-805 hover:border-slate-700 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white transition-all text-xs font-bold active:scale-95 duration-200"
                >
                  Imprimir
                </button>
                <button
                  onClick={handleCloseViewer}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-205 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 duration-200"
                >
                  Fechar Visualizador
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto bg-slate-950 p-6 flex items-center justify-center relative select-none z-30">
              {viewerFile.downloadUrl && viewerFile.downloadUrl !== "#" ? (
                <iframe 
                  src={`${viewerFile.downloadUrl}#toolbar=0&navpanes=0`} 
                  className="w-full h-full border-0 rounded-2xl bg-slate-950" 
                  title="Secure Doc Frame"
                />
              ) : (
                // Mock doc display for high-fidelity simulation
                <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6 text-slate-300 font-serif leading-relaxed shadow-lg">
                  <div className="text-center space-y-2 border-b border-slate-800 pb-6">
                    <h2 className="text-xl font-bold font-sans text-slate-100 uppercase tracking-wide">
                      InovaHelix - Acordo de Homologação
                    </h2>
                    <p className="text-xs font-mono text-slate-500 tracking-wider">
                      CÓDIGO DE CONTROLE: IH-VDR-{viewerFile.id.toUpperCase()}-SECURE
                    </p>
                  </div>
                  
                  <div className="space-y-4 text-xs font-sans text-slate-400 leading-normal">
                    <p>
                      <strong>PROJETO:</strong> {projectTitle || "Inovação InovaHelix"} <br />
                      <strong>CATEGORIA:</strong> {viewerFile.category.toUpperCase()} • <strong>NÍVEL:</strong> RESTRITO (NDA)
                    </p>
                    <p>
                      Este documento é de propriedade intelectual exclusiva e contém informações comerciais confidenciais, segredos industriais e dados laboratoriais protegidos nos termos da Lei Federal nº 9.279/96 (Propriedade Industrial) e sob o amparo do Acordo de Confidencialidade firmado previamente por clique digital (clickwrap) sob a chave de hash do investidor.
                    </p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    <h3 className="text-sm font-bold font-sans text-slate-200">1. Descrição dos Ensaios e Validações</h3>
                    <p className="text-xs">
                      Os testes e ensaios técnicos descritos neste relatório foram executados nos laboratórios credenciados pela ICT (Inatel - Wireless & AI Lab). O TRL certificado corresponde a maturidade tecnológica homologada, apresentando estabilidade operacional superior a 99.4% em ambiente simulado de rede LTE Mesh.
                    </p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    <h3 className="text-sm font-bold font-sans text-slate-200">2. Propriedade Intelectual e Royalties</h3>
                    <p className="text-xs">
                      A patente descrita neste documento de PI encontra-se sob o regime de compartilhamento e transferência tecnológica exclusiva/não-exclusiva, com termos de licenciamento sob taxa de royalties base estipulada em 3.5% sobre faturamento líquido das unidades integradoras de RF.
                    </p>
                  </div>

                  <div className="pt-8 flex justify-between text-[10px] font-sans text-slate-500">
                    <div>
                      <p className="font-bold text-slate-400">Assinado Digitalmente por:</p>
                      <p>Inatel NIT Management - Sistema InovaHelix</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-400">Hash de Validação:</p>
                      <p className="font-mono">SHA256: {viewerFile.id.slice(0, 16).toUpperCase()}...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500 font-mono z-50">
              <div>Sessão Ativa: {getSessionId().slice(0, 20)}...</div>
              <div>Visualizado por: {user?.email} ({viewerIp})</div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
