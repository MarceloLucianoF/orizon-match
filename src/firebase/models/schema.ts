import type {
  CreateProjectFormData,
  Interest,
  Match,
  Project,
  User,
} from "../../types";

export const FIREBASE_COLLECTIONS = {
  users: "users",
  projects: "projects",
  matches: "matches",
  interests: "interests",
  onboardingDrafts: "onboarding_drafts",
} as const;

export type FirebaseCollection = (typeof FIREBASE_COLLECTIONS)[keyof typeof FIREBASE_COLLECTIONS];

export interface UserDoc extends Omit<User, "id" | "createdAt" | "updatedAt"> {
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDoc extends Omit<Project, "id" | "createdAt" | "updatedAt"> {
  createdAt: string;
  updatedAt: string;
}

export interface MatchDoc extends Omit<Match, "id" | "createdAt" | "updatedAt" | "viewedAt" | "interactedAt"> {
  createdAt: string;
  updatedAt: string;
  viewedAt?: string;
  interactedAt?: string;
}

export interface InterestDoc extends Omit<Interest, "id" | "createdAt"> {
  createdAt: string;
}

export interface OnboardingDraftDoc {
  uid: string;
  profileType: User["tipo"];
  formData: Partial<CreateProjectFormData>;
  lastStep: number;
  updatedAt: string;
}

export interface FirebaseIndexesPlan {
  description: string;
  collection: FirebaseCollection;
  fields: Array<{ fieldPath: string; order?: "ASCENDING" | "DESCENDING" }>;
}

export const FIREBASE_INDEX_PLAN: FirebaseIndexesPlan[] = [
  {
    description: "Buscar projetos por status e data",
    collection: FIREBASE_COLLECTIONS.projects,
    fields: [
      { fieldPath: "status", order: "ASCENDING" },
      { fieldPath: "createdAt", order: "DESCENDING" },
    ],
  },
  {
    description: "Buscar matches por usuario ordenados por score",
    collection: FIREBASE_COLLECTIONS.matches,
    fields: [
      { fieldPath: "userId", order: "ASCENDING" },
      { fieldPath: "score", order: "DESCENDING" },
    ],
  },
  {
    description: "Buscar interests por projeto",
    collection: FIREBASE_COLLECTIONS.interests,
    fields: [
      { fieldPath: "projectId", order: "ASCENDING" },
      { fieldPath: "createdAt", order: "DESCENDING" },
    ],
  },
];
