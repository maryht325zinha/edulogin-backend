import React, { useState, useEffect, useCallback } from 'react';
import { User, AuthState, Site, Credential, ToastMessage, ToastType } from './types';
import { api } from './services/api.service';
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
  const [isLoading, setIsLoading] = useState(false);
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
  const [sites, setSites] = useState<Site[]>([]);
  const [credentials, setCredentials] = useState<Credential[]>([]);

  // Initialize Data
  useEffect(() => {
    const loadSites = async () => {
      try {
        const data = await api.getSites();
        setSites(data);
      } catch (error) {
        console.error('Erro ao carregar sites:', error);
        // Fallback or silent fail if api is waking up
      }
    };
    loadSites();
  }, []);

  // Load credentials for logged in user
  useEffect(() => {
    if (auth.isAuthenticated) {
      const loadCredentials = async () => {
        try {
          const data = await api.getCredentials();
          setCredentials(data);
        } catch (error) {
          console.error('Erro ao carregar credenciais:', error);
          if (error instanceof Error && error.message.includes('401')) {
            handleLogout();
          }
        }
      };
      loadCredentials();
    } else {
      setCredentials([]);
    }
  }, [auth.isAuthenticated]);

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.login(email);
      setAuth({ ...response, isAuthenticated: true });
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({ ...response, isAuthenticated: true }));
      addToast(`Bem-vindo de volta, ${response.user?.name}!`);
      setEmail('');
    } catch (error) {
      addToast('Erro ao entrar. Verifique seu e-mail ou cadastre-se.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.register(name, email);
      // Auto login after register? Backend returns auth state usually
      // The current controller returns user and token, so yes.
      setAuth({ ...response, isAuthenticated: true });
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({ ...response, isAuthenticated: true }));
      addToast('Conta criada com sucesso!');
      setIsRegistering(false);
      setName('');
      setEmail('');
    } catch (error) {
      addToast('Erro ao criar conta. Tente outro e-mail.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setAuth({ user: null, isAuthenticated: false, token: null });
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    addToast('Sessão encerrada.');
  };

  const handleSaveCredential = async (login: string, pass: string) => {
    if (!auth.user || !selectedSite) return;

    try {
      // Check if updating or creating
      const existing = credentials.find(c => c.siteId === selectedSite.id);
      let updatedCred: Credential;

      if (existing) {
        updatedCred = await api.updateCredential(existing.id, login, pass);
        addToast(`Acesso atualizado para ${selectedSite.name}`);
      } else {
        updatedCred = await api.saveCredential(selectedSite.id, login, pass);
        addToast(`Acesso salvo para ${selectedSite.name}`);
      }

      // Refresh credentials locally
      const newCredentials = await api.getCredentials();
      setCredentials(newCredentials);
      setIsModalOpen(false);

    } catch (error) {
      addToast('Erro ao salvar credencial.', 'error');
    }
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
            <p className="text-sub" style={{ fontSize: '0.75rem', marginTop: '0.2rem', opacity: 0.7 }}>Versão Nuvem ☁️</p>
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
                  disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', opacity: isLoading ? 0.7 : 1 }}
              disabled={isLoading}
            >
              {isLoading ? 'Carregando...' : (isRegistering ? 'Cadastrar' : 'Entrar')}
            </button>
          </form>

          <div className="text-center" style={{ marginTop: '2rem' }}>
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="btn btn-secondary"
              style={{ fontSize: '0.875rem' }}
              disabled={isLoading}
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
          {sites.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', opacity: 0.6 }}>
              {isLoading ? 'Carregando sites...' : 'Nenhum site disponível. Tente recarregar a página.'}
            </div>
          ) : (
            filteredSites.map(site => (
              <SiteCard
                key={site.id}
                site={site}
                credential={credentials.find(c => c.siteId === site.id)}
                onEdit={(s) => { setSelectedSite(s); setIsModalOpen(true); }}
                onCopy={copyToClipboard}
                isDark={isDark}
              />
            ))
          )}
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
