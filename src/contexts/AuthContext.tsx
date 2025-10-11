import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, isDemoMode } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isDemoMode: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for demo mode
const DEMO_USER = {
  uid: 'demo-user-123',
  email: 'demo@verifyai.com',
  displayName: 'Demo User'
} as User;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isDemoMode) {
      // In demo mode, check localStorage for demo user
      const demoUserLoggedIn = localStorage.getItem('demoUserLoggedIn');
      if (demoUserLoggedIn === 'true') {
        setUser(DEMO_USER);
      }
      setLoading(false);
      return;
    }

    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    if (isDemoMode) {
      // Demo mode - accept any credentials
      localStorage.setItem('demoUserLoggedIn', 'true');
      setUser(DEMO_USER);
      toast({
        title: "Demo Mode",
        description: "Logged in with demo account. Add Firebase config for real authentication.",
      });
      return;
    }

    if (!auth) throw new Error('Firebase not configured');
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    if (isDemoMode) {
      // Demo mode - accept any credentials
      localStorage.setItem('demoUserLoggedIn', 'true');
      setUser(DEMO_USER);
      toast({
        title: "Demo Mode",
        description: "Account created in demo mode. Add Firebase config for real authentication.",
      });
      return;
    }

    if (!auth) throw new Error('Firebase not configured');
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    if (isDemoMode) {
      toast({
        title: "Demo Mode",
        description: "Google sign-in requires Firebase configuration",
        variant: "destructive"
      });
      return;
    }

    if (!auth) throw new Error('Firebase not configured');
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signOut = async () => {
    if (isDemoMode) {
      localStorage.removeItem('demoUserLoggedIn');
      setUser(null);
      return;
    }

    if (!auth) return;
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isDemoMode, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};