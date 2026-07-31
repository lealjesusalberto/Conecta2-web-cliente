import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, onValue, get } from 'firebase/database';
import { auth, database } from './config/firebase';

import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import MainMicrotrabajosScreen from './screens/MainMicrotrabajosScreen';
import PerfilScreen from './screens/PerfilScreen';
import CatalogoPremiosScreen from './screens/CatalogoPremiosScreen';
import InstallPwaModal from './components/InstallPwaModal';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('conecta2_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentScreen, setCurrentScreen] = useState(() => {
    const hasSeenWelcome = localStorage.getItem('conecta2_has_seen_welcome');
    if (!hasSeenWelcome) return 'welcome';
    return 'main_microtrabajos';
  });

  const [isInstallOpen, setIsInstallOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);

  // Escuchar sesión activa en Firebase Auth y obtener datos reales
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = ref(database, `users/${firebaseUser.uid}`);
        
        const mapRealUserData = (dbData) => {
          const rawPuntos = dbData.puntos_actuales ?? dbData.puntosActuales ?? dbData.puntos ?? dbData.puntos_acumulados_totales ?? 0;
          const rawNivel = dbData.nivel_cliente || dbData.nivelCliente || dbData.nivel || 'Bronce';
          const rawRating = dbData.calificacion || dbData.rating || 5.0;

          return {
            uid: firebaseUser.uid,
            email: firebaseUser.email || dbData.email || '',
            displayName: dbData.nombre || dbData.name || dbData.displayName || firebaseUser.displayName || 'Cliente Conecta2',
            photoURL: dbData.foto_perfil || dbData.foto_url || dbData.photoUrl || dbData.photoURL || firebaseUser.photoURL || null,
            phone: dbData.telefono || dbData.phone || firebaseUser.phoneNumber || '',
            cedula: dbData.cedula || dbData.cedula_identidad || '',
            puntos: Number(rawPuntos),
            nivel: rawNivel,
            rating: Number(rawRating),
            role: dbData.role || 'cliente'
          };
        };

        get(userRef).then((snapshot) => {
          if (snapshot.exists()) {
            const realUser = mapRealUserData(snapshot.val());
            setUser(realUser);
            localStorage.setItem('conecta2_user', JSON.stringify(realUser));
          }
        });

        const unsubscribeDb = onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const realUser = mapRealUserData(snapshot.val());
            setUser(realUser);
            localStorage.setItem('conecta2_user', JSON.stringify(realUser));
          }
        });

        return () => unsubscribeDb();
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Catch PWA Install Prompt
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsPwaInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsPwaInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleMarkWelcomeSeen = () => {
    localStorage.setItem('conecta2_has_seen_welcome', 'true');
  };

  const handleLoginSuccess = (userData) => {
    handleMarkWelcomeSeen();
    setUser(userData);
    localStorage.setItem('conecta2_user', JSON.stringify(userData));
    setCurrentScreen('main_microtrabajos');
  };

  const handleRegisterSuccess = (userData) => {
    handleMarkWelcomeSeen();
    setUser(userData);
    localStorage.setItem('conecta2_user', JSON.stringify(userData));
    setCurrentScreen('main_microtrabajos');
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('conecta2_user', JSON.stringify(updatedUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('conecta2_user');
    setCurrentScreen('welcome');
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* 1. Welcome Screen */}
      {currentScreen === 'welcome' && (
        <WelcomeScreen
          onGoToRegister={() => {
            handleMarkWelcomeSeen();
            setCurrentScreen('register');
          }}
          onGoToLogin={() => {
            handleMarkWelcomeSeen();
            setCurrentScreen('login');
          }}
        />
      )}

      {/* 2. Login Screen */}
      {currentScreen === 'login' && (
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          onGoToRegister={() => setCurrentScreen('register')}
          onGoBack={() => setCurrentScreen('main_microtrabajos')}
        />
      )}

      {/* 3. Client Register Screen */}
      {currentScreen === 'register' && (
        <RegisterScreen
          onRegisterSuccess={handleRegisterSuccess}
          onGoToLogin={() => setCurrentScreen('login')}
          onGoBack={() => setCurrentScreen('main_microtrabajos')}
        />
      )}

      {/* 4. Main Microtrabajos Screen */}
      {currentScreen === 'main_microtrabajos' && (
        <MainMicrotrabajosScreen
          user={user}
          onOpenAuth={() => {
            if (user) {
              setCurrentScreen('perfil');
            } else {
              setCurrentScreen('login');
            }
          }}
          onOpenRewards={() => setCurrentScreen('catalogo_premios')}
          onOpenInstall={() => setIsInstallOpen(true)}
          isPwaInstalled={isPwaInstalled}
        />
      )}

      {/* 5. Perfil Screen */}
      {currentScreen === 'perfil' && (
        <PerfilScreen
          user={user}
          onGoBack={() => setCurrentScreen('main_microtrabajos')}
          onUpdateUser={handleUpdateUser}
          onLogout={handleLogout}
        />
      )}

      {/* 6. Catalogo de Premios Screen */}
      {currentScreen === 'catalogo_premios' && (
        <CatalogoPremiosScreen
          user={user}
          onGoBack={() => setCurrentScreen('main_microtrabajos')}
        />
      )}

      {/* PWA Direct Installation Modal */}
      <InstallPwaModal
        isOpen={isInstallOpen}
        onClose={() => setIsInstallOpen(false)}
        deferredPrompt={deferredPrompt}
      />
    </div>
  );
}
