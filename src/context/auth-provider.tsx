'use client';

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import {Loader2} from 'lucide-react';
import {usePathname, useRouter} from 'next/navigation';
import {
  getAuth,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  onSnapshot,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {app} from '@/lib/firebase';

const auth = getAuth(app);
const db = getFirestore(app);

export type UserProfile = {
  uid: string;
  displayName: string | null;
  email: string | null;
  role: 'individual' | 'msme';
  createdAt: any;
  msmeName?: string;
  msmeService?: string;
  msmeLocation?: string;
  ownerContact?: string;
  msmeWebsite?: string;
};

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: {children: ReactNode}) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      // Don't set loading to true here to prevent flicker
      if (firebaseUser) {
        setUser(firebaseUser);
        const userDocRef = doc(db, 'users', firebaseUser.uid);

        // Listen for profile changes
        const unsubProfile = onSnapshot(userDocRef, snapshot => {
          if (snapshot.exists()) {
            setUserProfile(snapshot.data() as UserProfile);
          } else {
            // This can happen on first login if the doc isn't created yet.
            // The signup process handles doc creation, but this is a fallback.
            getDoc(userDocRef).then(docSnap => {
              if (!docSnap.exists()) {
                const newProfile: UserProfile = {
                  uid: firebaseUser.uid,
                  displayName: firebaseUser.displayName,
                  email: firebaseUser.email,
                  role: 'individual', // default role
                  createdAt: serverTimestamp(),
                };
                setDoc(userDocRef, newProfile);
                setUserProfile(newProfile);
              }
            });
          }
          setLoading(false); // Set loading to false after profile is processed
        });

        if (pathname === '/login' || pathname === '/signup') {
          router.replace('/');
        }
        return () => unsubProfile(); // Cleanup profile listener
      } else {
        setUser(null);
        setUserProfile(null);
        const isPublicPage = pathname === '/login' || pathname === '/signup';
        if (!isPublicPage) {
          router.replace('/login');
        }
        setLoading(false);
      }
    });

    return () => unsubscribe(); // Cleanup auth listener
  }, [router, pathname]);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {user, userProfile, loading, signOut};

  // While initial authentication check is running, show a global loader.
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  if (loading && !isAuthPage) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
