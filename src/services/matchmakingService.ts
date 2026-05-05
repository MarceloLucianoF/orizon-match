import { addDoc, collection, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { FIREBASE_COLLECTIONS } from "../firebase/models/schema";
import { calculateMatchScore } from "../lib/matching";
import type { CreateProjectFormData, Project, User, StakeholderType, IdeaMaturidade, InovaType, Localizacao } from "../types";

export interface ProjectCreationInput {
  userId: string;
  userName: string;
  title: string;
  description: string;
  segment: string;
  maturity: IdeaMaturidade;
  type: InovaType;
  needs: StakeholderType[];
  location: Localizacao;
  patent?: Project["patent"];
  protectionIntent?: Project["protectionIntent"];
  summaryMethod: "guiado" | "textoLivre";
  summaryDetails?: Project["summaryDetails"];
  formData?: Partial<CreateProjectFormData>;
}

function normalizeProject(input: ProjectCreationInput, id: string): Project {
  return {
    id,
    userId: input.userId,
    userName: input.userName,
    title: input.title,
    description: input.description,
    segmento: input.segment,
    maturidade: input.maturity,
    tipo: input.type,
    precisa: input.needs,
    localizacao: input.location,
    status: "publicado",
    patent: input.patent,
    protectionIntent: input.protectionIntent,
    summaryMethod: input.summaryMethod,
    summaryDetails: input.summaryDetails,
    views: 0,
    matches: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function createProjectAndMatches(input: ProjectCreationInput): Promise<string> {
  const createdAt = serverTimestamp();

  const projectRef = await addDoc(collection(db, FIREBASE_COLLECTIONS.projects), {
    userId: input.userId,
    userName: input.userName,
    title: input.title,
    description: input.description,
    segmento: input.segment,
    maturidade: input.maturity,
    tipo: input.type,
    precisa: input.needs,
    localizacao: input.location,
    status: "publicado",
    patent: input.patent ?? null,
    protectionIntent: input.protectionIntent ?? null,
    summaryMethod: input.summaryMethod,
    summaryDetails: input.summaryDetails ?? null,
    views: 0,
    matches: 0,
    createdAt,
    updatedAt: createdAt,
  });

  const project = normalizeProject(input, projectRef.id);
  const snapshot = await getDocs(collection(db, FIREBASE_COLLECTIONS.users));

  const matchingRecords = snapshot.docs
    .filter((doc) => doc.id !== projectRef.id)
    .map((doc) => ({ id: doc.id, ...(doc.data() as Omit<User, "id">) }))
    .map((candidate) => {
      const scoreResult = calculateMatchScore(project, candidate as User);

      return {
        projectA: projectRef.id,
        projectB: candidate.id,
        score: scoreResult.score,
        breakdown: scoreResult.breakdown,
        createdAt,
      };
    })
    .filter((match) => match.score > 60);

  for (const match of matchingRecords) {
    await addDoc(collection(db, FIREBASE_COLLECTIONS.matches), match);
  }

  return projectRef.id;
}

export async function createInterest(input: { projectId: string; userId: string; message?: string }) {
  return addDoc(collection(db, FIREBASE_COLLECTIONS.interests), {
    projectId: input.projectId,
    userId: input.userId,
    message: input.message ?? "",
    status: "interested",
    createdAt: serverTimestamp(),
  });
}