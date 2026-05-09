import { collection, addDoc, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";

export interface ProjectData {
  userId: string;
  title: string;
  type: string;
  segment: string;
  maturity: number;
  needs: {
    investment: boolean;
    research: boolean;
    industry: boolean;
  };
  location: {
    region: string;
  };
  createdAt?: number;
  active?: boolean;
}

export async function createProject(data: ProjectData) {
  try {
    const docRef = await addDoc(collection(db, "projects"), {
      ...data,
      active: true,
      createdAt: Date.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
}

export async function getUserProjects(userId: string) {
  try {
    const q = query(
      collection(db, "projects"),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, active: true, ...doc.data() }));
  } catch (error) {
    console.error("Error getting user projects:", error);
    throw error;
  }
}

export async function updateProject(projectId: string, data: Partial<ProjectData>) {
  try {
    const projectRef = doc(db, "projects", projectId);
    await updateDoc(projectRef, data);
  } catch (error) {
    console.error("Error updating project:", error);
    throw error;
  }
}
