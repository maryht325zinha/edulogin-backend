
import React, { useState, useEffect } from 'react';
import { Site, Credential } from '../../types';

interface CredentialModalProps {
  site: Site;
  currentCredential?: Credential;
  isOpen: boolean;
  onClose: () => void;
  onSave: (login: string, pass: string) => void;
  isDark: boolean;
}

const CredentialModal: React.FC<CredentialModalProps> = ({ site, currentCredential, isOpen, onClose, onSave }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (currentCredential) {
      setLogin(currentCredential.login);
      setPassword(atob(currentCredential.passwordEncrypted));
    } else {
      setLogin('');
      setPassword('');
    }
  }, [currentCredential, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="card modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem' }}>{site.icon}</div>
          <div>
            <h2 className="text-xl font-bold">{site.name}</h2>
            <p className="text-sub text-sm">Gerenciar credenciais</p>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(login, password); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="text-sm font-bold text-sub" style={{ display: 'block', marginBottom: '0.5rem' }}>USUÁRIO / E-MAIL</label>
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Ex: professor.silva"
              className="input"
              required
            />
          </div>

          <div>
            <label className="text-sm font-bold text-sub" style={{ display: 'block', marginBottom: '0.5rem' }}>SENHA</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input"
                style={{ paddingRight: '2.5rem' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}
                tabIndex={-1}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CredentialModal;
