import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { calculateMatch } from "../lib/matching";

export interface ExploreFilters {
  segment?: string;
  minTrl?: number;
  minScore?: number;
  region?: string;
  search?: string;
}

/**
 * Busca projetos no Firestore e calcula match score contra o perfil do usuario logado.
 * Retorna lista ordenada por score decrescente.
 */
export async function getExploreProjects(userProfile: any, userProjects: any[], filters: ExploreFilters = {}) {
  try {
    const snapshot = await getDocs(collection(db, "projects"));
    
    // Get IDs of user's own projects to exclude them
    const ownProjectIds = new Set(userProjects.map((p: any) => p.id));
    
    let results = snapshot.docs
      .map(d => ({ id: d.id, ...d.data() as any }))
      .filter(p => 
        !ownProjectIds.has(p.id) && 
        p.userId !== userProfile?.uid &&
        p.active !== false // Exclude explicitly deactivated projects
      );

    // Apply local filters
    if (filters.segment) {
      results = results.filter(p => p.segment === filters.segment);
    }
    
    if (filters.minTrl) {
      results = results.filter(p => (p.maturity || p.trlScore || 1) >= filters.minTrl!);
    }

    if (filters.region) {
      results = results.filter(p => p.location?.region === filters.region);
    }

    if (filters.search) {
      const term = filters.search.toLowerCase();
      results = results.filter(p => 
        p.title?.toLowerCase().includes(term) || 
        p.segment?.toLowerCase().includes(term) ||
        p.summary?.toLowerCase().includes(term)
      );
    }

    // Calculate match score for each result against user's profile
    const scored = results.map(project => {
      const targetProfile = {
        ...userProfile,
        segment: userProfile?.segments?.[0] || userProfile?.segment,
        preferredTrl: userProfile?.preferredTrl || 6,
      };
      
      const { score, breakdown } = calculateMatch(project, targetProfile);
      
      return {
        ...project,
        score,
        breakdown,
        isVdrReady: project.isVdrReady || (project.dueDiligenceProgress === 100),
      };
    });

    // Apply score filter
    const minScore = filters.minScore || 0;
    const filtered = scored.filter(p => p.score >= minScore);

    // Sort by score descending
    return filtered.sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error("Erro no exploreService:", error);
    return [];
  }
}
