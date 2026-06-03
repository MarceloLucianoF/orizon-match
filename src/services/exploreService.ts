import { 
  collection, getDocs, query, where, limit, 
  startAfter, getDoc, doc, DocumentSnapshot 
} from "firebase/firestore";
import { db } from "../firebase/config";
import { calculateMatch } from "../lib/matching";
import { checkExistingNDA } from "./ndaService";

export interface ExploreFilters {
  segment?: string;
  minTrl?: number;
  minScore?: number;
  region?: string;
  search?: string;
  fomento?: string;
  investmentStage?: string;
  ticketRange?: string;
  onlyIctVerified?: boolean;
}

export interface ExploreResponse {
  projects: any[];
  lastDoc: DocumentSnapshot | null;
}

/**
 * Busca projetos no Firestore de forma paginada e segura.
 * Filtra dados sensiveis se o usuario nao for autorizado (Premium, Admin, Dono ou NDA assinado).
 */
export async function getExploreProjects(
  userProfile: any, 
  userProjects: any[], 
  filters: ExploreFilters = {},
  pageSize: number = 10,
  startAfterDoc: DocumentSnapshot | null = null
): Promise<ExploreResponse> {
  try {
    // ID dos projetos do proprio usuario para exclusao
    const ownProjectIds = new Set(userProjects.map((p: any) => p.id));
    
    // 1. Construir query server-side com filtros exatos e limites
    // Usamos limit ampliado (ex: pageSize * 3) para dar margem para filtros locais (como busca textual e trl)
    let q = query(
      collection(db, "projects"),
      where("status", "==", "active"),
      limit(pageSize * 3)
    );

    if (filters.segment) {
      q = query(q, where("segment", "==", filters.segment));
    }

    if (filters.onlyIctVerified) {
      q = query(q, where("isIctVerified", "==", true));
    }

    if (startAfterDoc) {
      q = query(q, startAfter(startAfterDoc));
    }

    const snapshot = await getDocs(q);
    const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

    let results = snapshot.docs
      .map(d => ({ id: d.id, ...d.data() as any }))
      .filter(p => 
        !ownProjectIds.has(p.id) && 
        p.userId !== userProfile?.uid
      );

    // 2. Filtros Locais (Busca de texto, trl, fomento, etc.)
    if (filters.minTrl) {
      results = results.filter(p => (p.maturity || p.trlScore || p.declaredTRL || 1) >= filters.minTrl!);
    }

    if (filters.region) {
      results = results.filter(p => p.location?.region?.toLowerCase().includes(filters.region!.toLowerCase()));
    }

    if (filters.fomento) {
      results = results.filter(p => 
        p.fomento === filters.fomento || 
        (Array.isArray(p.fomento) && p.fomento.includes(filters.fomento)) ||
        p.fundingSource === filters.fomento ||
        (Array.isArray(p.fundingSource) && p.fundingSource.includes(filters.fomento)) ||
        (Array.isArray(p.fundingTags) && p.fundingTags.includes(filters.fomento))
      );
    }

    if (filters.investmentStage) {
      results = results.filter(p => p.investmentStage === filters.investmentStage);
    }

    if (filters.ticketRange) {
      results = results.filter(p => p.ticketRange === filters.ticketRange);
    }

    if (filters.search) {
      const term = filters.search.toLowerCase();
      results = results.filter(p => 
        p.title?.toLowerCase().includes(term) || 
        p.segment?.toLowerCase().includes(term) ||
        p.summary?.toLowerCase().includes(term) ||
        p.ictName?.toLowerCase().includes(term)
      );
    }

    // Limitar ao tamanho da pagina solicitado apos os filtros locais
    results = results.slice(0, pageSize);

    // 3. Obter dados privados de projetos de forma segura e paralela apenas para os itens da pagina
    const finalProjects = await Promise.all(results.map(async (project) => {
      const isPremium = userProfile?.subscriptionStatus === 'premium' || 
                        userProfile?.subscriptionStatus === 'enterprise' || 
                        userProfile?.role === 'admin';
      
      const isOwner = project.userId === userProfile?.uid;
      
      // Checar se o investidor tem NDA assinado para este projeto
      const hasNda = userProfile?.uid ? await checkExistingNDA(userProfile.uid, project.id) : false;
      const isAuthorized = isPremium || isOwner || hasNda;

      let privateData: any = {};
      if (isAuthorized && userProfile?.uid) {
        try {
          const privateSnap = await getDoc(doc(db, "projects", project.id, "private", "details"));
          if (privateSnap.exists()) {
            privateData = privateSnap.data();
          }
        } catch (e) {
          console.error(`Erro ao carregar dados privados do projeto ${project.id}:`, e);
        }
      }

      const mergedProject = {
        ...project,
        researcher: privateData.researcher || "",
        patentStatus: privateData.patentStatus || "",
        contactEmail: privateData.contactEmail || "",
        confidentialNotes: privateData.confidentialNotes || "",
        isPrivateDataUnlocked: isAuthorized
      };

      // Calcular match score
      const targetProfile = {
        ...userProfile,
        segment: userProfile?.segments?.[0] || userProfile?.segment,
        preferredTrl: userProfile?.preferredTrl || 6,
      };
      
      const { score, breakdown } = calculateMatch(mergedProject, targetProfile);
      
      return {
        ...mergedProject,
        score,
        breakdown,
        isVdrReady: project.isVdrReady || (project.dueDiligenceProgress === 100),
      };
    }));

    // Filtrar pelo score minimo se solicitado
    const minScore = filters.minScore || 0;
    const filtered = finalProjects.filter(p => p.score >= minScore);

    // Ordenar por score decrescente
    return {
      projects: filtered.sort((a, b) => b.score - a.score),
      lastDoc
    };
  } catch (error) {
    console.error("Erro no exploreService:", error);
    return {
      projects: [],
      lastDoc: null
    };
  }
}
