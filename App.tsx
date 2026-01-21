import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, AuthState, Site, Credential, ToastMessage, ToastType } from './types';
import { db } from './services/db.service';
import { STORAGE_KEYS } from './constants';
import SiteCard from './components/Dashboard/SiteCard';
import CredentialModal from './components/Dashboard/CredentialModal';
import Toast from './components/Toast';

const App: React.FC = () => {
  // Authentication State
  const [auth, setAuth] = useState<AuthState>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SESSION);
    return saved ? JSON.parse(saved) : { user: null, isAuthenticated: false, token: null };
  });

  // UI State
  const [isRegistering, setIsRegistering] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    return saved === 'dark';
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // App Data
  // Using LocalStorage DB Service for immediate display
  const sites = useMemo(() => db.getSites(), []);
  const [credentials, setCredentials] = useState<Credential[]>([]);

  // Load credentials for logged in user
  useEffect(() => {
    if (auth.user) {
      setCredentials(db.getUserCredentials(auth.user.id));
    } else {
      setCredentials([]);
    }
  }, [auth.user]);

  // Theme Sync
  useEffect(() => {
    document.body.classList.toggle('dark', isDark);
    localStorage.setItem(STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
  }, [isDark]);

  const addToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Using Local DB Service
    const user = db.findUserByEmail(email);

    if (user) {
      // Login via e-mail only as requested
      const session = { user, isAuthenticated: true, token: 'mock-jwt-token' };
      setAuth(session);
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
      addToast(`Bem-vindo, ${user.name}!`);
      // Clear sensitive state
      setEmail('');
    } else {
      addToast('Usuário não encontrado. Por favor, cadastre-se.', 'error');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (db.findUserByEmail(email)) {
      addToast('Este e-mail já está em uso.', 'error');
      return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      passwordHash: btoa('default123'), // Mock default password
      createdAt: new Date().toISOString()
    };
    db.saveUser(newUser);
    addToast('Conta criada com sucesso! Entre com seu e-mail.');
    setIsRegistering(false);
  };

  const handleLogout = () => {
    setAuth({ user: null, isAuthenticated: false, token: null });
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    addToast('Sessão encerrada.');
  };

  const handleSaveCredential = (login: string, pass: string) => {
    if (!auth.user || !selectedSite) return;

    const newCred: Credential = {
      id: Date.now().toString(),
      userId: auth.user.id,
      siteId: selectedSite.id,
      login,
      passwordEncrypted: btoa(pass),
      updatedAt: new Date().toISOString()
    };

    db.saveCredential(newCred);
    setCredentials(db.getUserCredentials(auth.user.id));
    setIsModalOpen(false);
    addToast(`Acesso salvo para ${selectedSite.name}`);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addToast(`${label} copiado com sucesso!`, 'info');
  };

  const filteredSites = sites.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!auth.isAuthenticated) {
    return (
      <div className="login-container">
        <div className="card card-glass login-card animate-fade-in">
          <div className="text-center" style={{ marginBottom: '2rem' }}>
            <div className="logo-icon">
              <span>🔐</span>
            </div>
            <h1 className="text-2xl font-bold" style={{ marginBottom: '0.5rem' }}>EduLogin</h1>
            <p className="text-sub">Gerenciador de Acessos Escolares</p>
            <p className="text-sub" style={{ fontSize: '0.75rem', marginTop: '0.2rem', opacity: 0.7 }}>Versão Local 🏠</p>
          </div>

          <form onSubmit={isRegistering ? handleRegister : handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {isRegistering && (
              <div>
                <label className="text-sm font-bold text-sub" style={{ display: 'block', marginBottom: '0.5rem' }}>NOME COMPLETO</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  placeholder="Seu nome"
                  required
                />
              </div>
            )}
            <div>
              <label className="text-sm font-bold text-sub" style={{ display: 'block', marginBottom: '0.5rem' }}>E-MAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="professor@escola.com"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
              {isRegistering ? 'Cadastrar' : 'Entrar'}
            </button>
          </form>

          <div className="text-center" style={{ marginTop: '2rem' }}>
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="btn btn-secondary"
              style={{ fontSize: '0.875rem' }}
            >
              {isRegistering ? 'Já tem conta? Entre aqui' : 'Não tem conta? Cadastre-se'}
            </button>
          </div>
        </div>

        <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          {toasts.map(t => <Toast key={t.id} toast={t} onClose={removeToast} />)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Navigation */}
      <nav className="navbar">
        <div className="container nav-content">
          <div className="flex items-center gap-sm">
            <div style={{ width: 40, height: 40, background: 'var(--color-primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.2rem' }}>
              🔐
            </div>
            <span className="logo-text">EduLogin</span>
          </div>

          <div className="flex items-center gap-md">
            <button
              onClick={() => setIsDark(!isDark)}
              className="btn-icon"
              title="Trocar tema"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            {/* Show user details */}
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 600 }}>{auth.user?.name}</span>
              <span className="text-sm text-sub">{auth.user?.email}</span>
            </div>

            <button
              onClick={handleLogout}
              className="btn-icon"
              style={{ color: 'var(--color-danger)' }}
              title="Sair"
            >
              🚪
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container" style={{ paddingBottom: '4rem' }}>
        <header style={{ margin: '3rem 0', display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="text-2xl font-bold">Painel do Professor</h2>
            <p className="text-sub">Gerencie seus acessos escolares de forma simples.</p>
          </div>

          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
            <input
              type="text"
              placeholder="Pesquisar site..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input"
              style={{ paddingLeft: '3rem' }}
            />
          </div>
        </header>

        {/* Site Grid */}
        <div className="grid-sites">
          {filteredSites.map(site => (
            <SiteCard
              key={site.id}
              site={site}
              credential={credentials.find(c => c.siteId === site.id)}
              onEdit={(s) => { setSelectedSite(s); setIsModalOpen(true); }}
              onCopy={copyToClipboard}
              isDark={isDark}
            />
          ))}
        </div>
      </main>

      {/* Modal & Toast Portal */}
      {selectedSite && (
        <CredentialModal
          isOpen={isModalOpen}
          site={selectedSite}
          currentCredential={credentials.find(c => c.siteId === selectedSite.id)}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveCredential}
          isDark={isDark}
        />
      )}

      <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', pointerEvents: 'none' }}>
        {toasts.map(t => <Toast key={t.id} toast={t} onClose={removeToast} />)}
      </div>
    </div>
  );
};

export default App;
