import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment 
} from 'firebase/firestore';

// 1. Firebase Config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 2. Auth State Observer & Profile Fetching
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserData(userSnap.data());
        } else {
          // New User Data Initialization
          const initialData = {
            name: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
            coins: 100, // Welcome Bonus
            diamonds: 0,
            level: 1,
            wealthRank: "مبتدئ",
            charismaRank: "عادي",
            isAdmin: false
          };
          await setDoc(userRef, initialData);
          setUserData(initialData);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 3. Handlers
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login Failed:", error);
    }
  };

  const handleLogout = () => signOut(auth);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a', color: '#fff' }}>
        <h2>جاري تحضير Salame 2.0...</h2>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', padding: '20px' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '15px' }}>
        <h1 style={{ color: '#38bdf8', margin: 0 }}>🎙️ Salame 2.0</h1>
        {user ? (
          <button onClick={handleLogout} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#ef4444', color: '#fff', cursor: 'pointer' }}>
            تسجيل الخروج
          </button>
        ) : (
          <button onClick={handleGoogleSignIn} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#3b82f6', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
            تسجيل الدخول بـ Google
          </button>
        )}
      </header>

      {/* Main Content */}
      <main style={{ marginTop: '30px' }}>
        {user && userData ? (
          <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <img src={userData.photoURL} alt="Profile" style={{ width: '60px', height: '60px', borderRadius: '50%' }} />
              <div>
                <h3 style={{ margin: 0 }}>{userData.name}</h3>
                <p style={{ margin: '5px 0 0 0', color: '#94a3b8' }}>{userData.email}</p>
              </div>
            </div>

            {/* Wallet & Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px' }}>
              <div style={{ backgroundColor: '#334155', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                <h4 style={{ margin: 0, color: '#facc15' }}>🪙 العملات</h4>
                <p style={{ fontSize: '20px', fontWeight: 'bold', margin: '5px 0 0 0' }}>{userData.coins}</p>
              </div>
              <div style={{ backgroundColor: '#334155', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                <h4 style={{ margin: 0, color: '#38bdf8' }}>💎 الألماس</h4>
                <p style={{ fontSize: '20px', fontWeight: 'bold', margin: '5px 0 0 0' }}>{userData.diamonds}</p>
              </div>
            </div>

            {/* Level & Ranks */}
            <div style={{ marginTop: '20px', backgroundColor: '#0f172a', padding: '15px', borderRadius: '8px' }}>
              <p>⭐ **المستوى:** {userData.level}</p>
              <p>👑 **رتبة الثروة:** {userData.wealthRank}</p>
              <p>✨ **رتبة الكاريزما:** {userData.charismaRank}</p>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2>مرحباً بك في تطبيق Salame 2.0</h2>
            <p style={{ color: '#94a3b8' }}>سجل دخولك الآن للوصول إلى غرف الصوت والعملات والبروفايل الشخصي.</p>
          </div>
        )}
      </main>
    </div>
  );
}
