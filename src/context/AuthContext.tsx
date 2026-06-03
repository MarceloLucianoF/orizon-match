import { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { 
  onAuthStateChanged, signOut as firebaseSignOut, 
  signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider,
  createUserWithEmailAndPassword, updateProfile
} from "firebase/auth";
import type { User } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const googleProvider = new GoogleAuthProvider();

interface AuthContextType {
  user: User | null;
  userProfile: any | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, profile: any) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setImpersonatedUid: (uid: string | null) => void;
  impersonatingAdminId: string | null;
  simulatedRole: string | null;
  setSimulatedRole: (role: string | null) => void;
  isActualAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [impersonatedUid, setImpersonatedUid] = useState<string | null>(null);
  const [simulatedRole, setSimulatedRole] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          } else {
            // First-time Google SSO user or manual register pending profile
            const newProfile = {
              uid: currentUser.uid,
              name: currentUser.displayName || "Usuário Orizon",
              email: currentUser.email || "",
              role: "user", // default role
              createdAt: serverTimestamp(),
            };
            await setDoc(doc(db, "users", currentUser.uid), newProfile);
            setUserProfile(newProfile);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
        setSimulatedRole(null);
        setImpersonatedUid(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Effect to handle Impersonation
  useEffect(() => {
    async function loadImpersonatedProfile() {
      const originalUser = auth.currentUser;
      if (impersonatedUid) {
        try {
          const userDoc = await getDoc(doc(db, "users", impersonatedUid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          }
        } catch (error) {
          console.error("Error fetching impersonated profile:", error);
        }
      } else if (originalUser) {
        // Reset to original profile
        try {
          const userDoc = await getDoc(doc(db, "users", originalUser.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          }
        } catch (error) {}
      }
    }
    loadImpersonatedProfile();
  }, [impersonatedUid]);

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUp = async (email: string, pass: string, profile: any) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const newUser = userCredential.user;

    // Set display name in Auth
    await updateProfile(newUser, { displayName: profile.name });

    // Create Firestore profile
    const newProfile = {
      uid: newUser.uid,
      ...profile,
      email,
      role: profile.role || "user",
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, "users", newUser.uid), newProfile);
    setUserProfile(newProfile);
  };

  const loginWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  // Automatically sync simulatedRole with impersonatedUid mappings
  const handleSetSimulatedRole = (role: string | null) => {
    setSimulatedRole(role);
    if (!role || role === 'admin') {
      setImpersonatedUid(null);
    } else {
      const mapping: Record<string, string> = {
        'ict': 'ict_inatel',
        'industry': 'comp_ericsson',
        'investor': 'inv_kaszek',
        'inventor': 'inventor_rafael',
      };
      setImpersonatedUid(mapping[role] || null);
    }
  };

  const originalUser = user;
  const actingUser = originalUser && impersonatedUid 
    ? new Proxy(originalUser, {
        get: (target, prop) => {
          if (prop === 'uid') return impersonatedUid;
          const value = target[prop as keyof User];
          return typeof value === 'function' ? value.bind(target) : value;
        }
      }) 
    : originalUser;

  const actingUserProfile = userProfile && simulatedRole
    ? { ...userProfile, role: simulatedRole }
    : userProfile;

  // The actual logged-in user is admin
  const isActualAdmin = auth.currentUser?.uid === "nqBV3Da1iqPbU46jGvO1ljBbIze2";

  return (
    <AuthContext.Provider value={{ 
      user: actingUser, 
      userProfile: actingUserProfile, 
      loading, 
      login, 
      signUp, 
      loginWithGoogle, 
      logout,
      setImpersonatedUid,
      impersonatingAdminId: impersonatedUid && originalUser ? originalUser.uid : null,
      simulatedRole,
      setSimulatedRole: handleSetSimulatedRole,
      isActualAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
