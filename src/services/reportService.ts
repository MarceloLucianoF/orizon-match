import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

export async function exportEcosystemReport() {
  try {
    const projectsSnap = await getDocs(collection(db, "projects"));
    const projects = projectsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const csvRows = [
      ["ID", "Título", "Segmento", "TRL", "IRL", "Status VDR", "Progresso Due Diligence (%)"],
      ...projects.map((p: any) => [
        p.id,
        p.title || "N/A",
        p.segment || "N/A",
        p.maturity || p.trlScore || 1,
        p.irlScore || 0,
        p.isVdrReady ? "Auditado" : "Pendente",
        p.dueDiligenceProgress || 0
      ])
    ];

    const csvContent = csvRows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `orizon_ecosystem_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error("Erro ao exportar relatório:", error);
    return false;
  }
}
