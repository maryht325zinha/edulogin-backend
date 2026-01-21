
import React from 'react';
import { Site, Credential } from '../../types';

interface SiteCardProps {
  site: Site;
  credential?: Credential;
  onEdit: (site: Site) => void;
  onCopy: (text: string, label: string) => void;
  isDark: boolean; // Kept for prop compatibility if needed, but styling is via CSS vars
}

const SiteCard: React.FC<SiteCardProps> = ({ site, credential, onEdit, onCopy }) => {
  const isSaved = !!credential;
  const hasUrl = site.url && site.url.trim() !== '';
  const [showPass, setShowPass] = React.useState(false);

  return (
    <div className="card site-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="site-icon flex items-center justify-center" style={{ fontSize: '1.5rem', background: 'var(--color-bg-light)' }}>
            {site.icon}
          </div>
          <div>
            <h3 className="font-bold text-xl">{site.name}</h3>
            <span
              style={{
                fontSize: '0.75rem',
                padding: '0.2rem 0.6rem',
                borderRadius: '99px',
                fontWeight: 600,
                backgroundColor: isSaved ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                color: isSaved ? 'var(--color-success)' : 'var(--color-warning)'
              }}
            >
              {isSaved ? 'Configurado' : 'Não configurado'}
            </span>
          </div>
        </div>
        {/* Status indicator dot */}
        <div className={`status-indicator ${isSaved ? 'status-configured' : 'status-missing'}`}></div>
      </div>

      <p className="text-sub" style={{ fontSize: '0.9rem', marginBottom: '1.5rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: '2.7rem' }}>
        {site.description}
      </p>

      <div style={{ display: 'grid', gap: '0.5rem' }}>
        {isSaved && credential ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Login & Password Display */}
            <div className="credential-box" style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

              {/* Login Row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>👤</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={credential.login}>
                    {credential.login}
                  </span>
                </div>
                <button
                  onClick={() => onCopy(credential.login, 'Login')}
                  className="btn-icon"
                  title="Copiar Login"
                  style={{ width: '32px', height: '32px', flexShrink: 0 }}
                >
                  📋
                </button>
              </div>

              {/* Password Row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>🔑</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 500, fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {showPass ? atob(credential.passwordEncrypted) : '••••••••'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                  <button
                    onClick={() => setShowPass(!showPass)}
                    className="btn-icon"
                    title={showPass ? "Ocultar senha" : "Ver senha"}
                    style={{ width: '32px', height: '32px' }}
                  >
                    {showPass ? '🙈' : '👁️'}
                  </button>
                  <button
                    onClick={() => onCopy(atob(credential.passwordEncrypted), 'Senha')}
                    className="btn-icon"
                    title="Copiar Senha"
                    style={{ width: '32px', height: '32px' }}
                  >
                    📋
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                onClick={() => onEdit(site)}
                className="btn btn-secondary"
                style={{ flex: 1, fontSize: '0.875rem', padding: '0.6rem', whiteSpace: 'nowrap' }}
              >
                Editar
              </button>
              {hasUrl && (
                <a
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ flex: 1, fontSize: '0.875rem', padding: '0.6rem', textDecoration: 'none', textAlign: 'center', whiteSpace: 'nowrap' }}
                >
                  Acessar
                </a>
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={() => onEdit(site)}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            Cadastrar Login
          </button>
        )}
      </div>
    </div>
  );
};

export default SiteCard;
