import { useState, useRef } from "react";
import type { DragEvent, ChangeEvent } from "react";
import { UploadCloud, AlertCircle, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

interface DropZoneProps {
  onFileAccepted: (file: File) => void;
  onBack: () => void;
}

export function DropZone({ onFileAccepted, onBack }: DropZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: DragEvent<HTMLDivElement | HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (selectedFile: File): boolean => {
    const allowedExtensions = ["pdf", "docx", "txt"];
    const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase();
    
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      setError("Formato de arquivo inválido. Por favor, envie um arquivo PDF, DOCX ou TXT.");
      setFile(null);
      return false;
    }

    const maxSizeInBytes = 15 * 1024 * 1024; // 15MB
    if (selectedFile.size > maxSizeInBytes) {
      setError("O arquivo excede o limite de 15MB. Por favor, envie um arquivo menor.");
      setFile(null);
      return false;
    }

    setError(null);
    setFile(selectedFile);
    return true;
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  const handleConfirm = () => {
    if (file) {
      onFileAccepted(file);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-white">Upload de Documento</h2>
        <p className="text-slate-400 max-w-md mx-auto">
          Arraste a patente, pitch deck ou sumário técnico do seu ativo. Nossa IA irá extrair e estruturar o Gêmeo Digital automaticamente.
        </p>
      </div>

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={file ? undefined : onButtonClick}
        className={`w-full border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden backdrop-blur-md ${
          dragActive
            ? "border-teal-500 bg-teal-500/10 shadow-[0_0_30px_rgba(0,181,156,0.2)]"
            : file
            ? "border-emerald-500/50 bg-emerald-500/5"
            : "border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-950/60"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx,.txt"
          onChange={handleChange}
        />

        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-500/20 to-transparent animate-pulse" />

        {file ? (
          <div className="space-y-4 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 mx-auto shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <CheckCircle2 size={32} />
            </div>
            <div className="space-y-1">
              <p className="text-white font-bold text-base truncate max-w-xs md:max-w-md mx-auto">{file.name}</p>
              <p className="text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
              className="text-xs text-red-400 hover:text-red-300 underline font-medium"
            >
              Remover arquivo e escolher outro
            </button>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto transition-all ${
              dragActive 
                ? "bg-teal-500/20 text-teal-400 scale-110" 
                : "bg-slate-900 text-slate-400 group-hover:scale-105"
            }`}>
              <UploadCloud size={32} className={dragActive ? "animate-bounce" : ""} />
            </div>
            <div className="space-y-1">
              <p className="text-white font-bold text-base">
                {dragActive ? "Solte o arquivo aqui" : "Arraste e solte seu arquivo aqui"}
              </p>
              <p className="text-xs text-slate-500">ou clique para navegar nos seus arquivos</p>
            </div>
            <div className="flex justify-center gap-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider pt-2">
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">PDF</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">DOCX</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">TXT</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Máx. 15MB</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5 animate-in slide-in-from-top-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="pt-6 border-t border-slate-800 flex justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition"
        >
          <ArrowLeft size={18} /> Voltar
        </button>
        {file && (
          <button
            onClick={handleConfirm}
            className="px-8 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition flex items-center gap-2 shadow-[0_0_20px_rgba(0,181,156,0.3)] animate-in fade-in zoom-in-95"
          >
            Analisar Ativo <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
