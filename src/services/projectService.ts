import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
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
}

export async function createProject(data: ProjectData) {
  try {
    const docRef = await addDoc(collection(db, "projects"), {
      ...data,
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
      // orderBy("createdAt", "desc") // Requires index, ommiting for now to avoid errors if not created
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting user projects:", error);
    throw error;
  }
}
