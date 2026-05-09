import { useState } from "react";
import { 
  FolderOpen, FileText, Lock, 
  ShieldCheck, Upload, Download, 
  MoreVertical, ChevronRight, Eye,
  FileBadge, Briefcase, TrendingUp
} from "lucide-react";

interface VDRFile {
  id: string;
  name: string;
  type: string;
  size: string;
  status: 'pending' | 'verified' | 'rejected';
  lastModified: string;
}

interface VDRFolder {
  id: string;
  name: string;
  icon: any;
  files: VDRFile[];
  isLocked: boolean;
}

export function VDRRoom({ isPublic = false, hasSignedNDA = false }) {
  const [activeFolder, setActiveFolder] = useState<string | null>(null);

  const folders: VDRFolder[] = [
    {
      id: 'pi',
      name: 'Propriedade Intelectual',
      icon: ShieldCheck,
      isLocked: false,
      files: [
        { id: '1', name: 'Relatorio_Anterioridade_INPI.pdf', type: 'PDF', size: '1.2 MB', status: 'verified', lastModified: '12/05/2024' },
        { id: '2', name: 'Certificado_Deposito_Patente.pdf', type: 'PDF', size: '450 KB', status: 'verified', lastModified: '10/05/2024' },
      ]
    },
    {
      id: 'finance',
      name: 'Planilhas & Financeiro',
      icon: TrendingUp,
      isLocked: isPublic && !hasSignedNDA,
      files: [
        { id: '3', name: 'Projecao_Financeira_2024_2027.xlsx', type: 'XLSX', size: '2.4 MB', status: 'pending', lastModified: '08/05/2024' },
        { id: '4', name: 'Plano_de_Negocios_Resumido.pdf', type: 'PDF', size: '3.1 MB', status: 'verified', lastModified: '05/05/2024' },
      ]
    },
    {
      id: 'legal',
      name: 'Jurídico & Contratos',
      icon: Briefcase,
      isLocked: isPublic && !hasSignedNDA,
      files: [
        { id: '5', name: 'Estatuto_Social_Orizon.pdf', type: 'PDF', size: '1.8 MB', status: 'verified', lastModified: '01/05/2024' },
        { id: '6', name: 'Acordo_de_Confidencialidade_Padrao.pdf', type: 'PDF', size: '890 KB', status: 'verified', lastModified: '28/04/2024' },
      ]
    },
    {
      id: 'pitch',
      name: 'Pitch Deck & Media',
      icon: FileBadge,
      isLocked: false,
      files: [
        { id: '7', name: 'Orizon_Match_Pitch_Deck_V3.pdf', type: 'PDF', size: '5.2 MB', status: 'verified', lastModified: '15/05/2024' },
        { id: '8', name: 'Video_Demonstracao_MVP.mp4', type: 'MP4', size: '45 MB', status: 'pending', lastModified: '14/05/2024' },
      ]
    }
  ];

  const currentFolder = folders.find(f => f.id === activeFolder);

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[600px]">
      <div className="p-6 border-b border-slate-800 bg-slate-900/80 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <FolderOpen className="text-indigo-400" size={20} /> Virtual Data Room (VDR)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Ambiente seguro para compartilhamento de documentação estratégica.</p>
        </div>
        {!isPublic && (
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2">
            <Upload size={14} /> Subir Documento
          </button>
        )}
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar Folders */}
        <div className="w-64 border-r border-slate-800 p-4 space-y-2 overflow-y-auto">
          {folders.map(folder => (
            <button
              key={folder.id}
              onClick={() => setActiveFolder(folder.id)}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all ${
                activeFolder === folder.id 
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(79,70,229,0.1)]' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <folder.icon size={18} className={activeFolder === folder.id ? 'text-indigo-400' : 'text-slate-500'} />
                <span className="text-sm font-medium">{folder.name}</span>
              </div>
              {folder.isLocked ? <Lock size={14} className="text-slate-600" /> : <ChevronRight size={14} className="text-slate-700" />}
            </button>
          ))}
        </div>

        {/* Files Area */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-950/30">
          {!activeFolder ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 animate-in fade-in duration-500">
              <FolderOpen size={48} className="opacity-20" />
              <p className="text-sm">Selecione uma pasta para visualizar os arquivos.</p>
            </div>
          ) : currentFolder?.isLocked ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                <Lock size={32} className="text-indigo-500" />
              </div>
              <div className="max-w-xs">
                <h4 className="text-slate-200 font-bold mb-2">Acesso Restrito</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Para visualizar a pasta <strong>{currentFolder.name}</strong>, é necessário a assinatura do Acordo de Confidencialidade (NDA).
                </p>
              </div>
              <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all">
                Solicitar Acesso / Assinar NDA
              </button>
            </div>
          ) : (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest">{currentFolder?.name}</h4>
                <span className="text-[10px] text-slate-500 font-bold uppercase">{currentFolder?.files.length} Arquivos</span>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {currentFolder?.files.map(file => (
                  <div key={file.id} className="group bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-4 flex items-center justify-between transition-all hover:shadow-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-indigo-400 transition-colors">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-slate-200">{file.name}</h5>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] text-slate-600 uppercase font-mono">{file.type} • {file.size}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                            file.status === 'verified' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {file.status === 'verified' ? <ShieldCheck size={10} /> : <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
                            {file.status === 'verified' ? 'Auditado' : 'Em Análise'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition" title="Visualizar">
                        <Eye size={18} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition" title="Baixar">
                        <Download size={18} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
