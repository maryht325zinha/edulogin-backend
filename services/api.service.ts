import { User, Site, Credential, AuthState } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getHeaders = () => {
    const session = localStorage.getItem('edupass_session');
    const token = session ? JSON.parse(session).token : null;
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

export const api = {
    // Auth
    async login(email: string): Promise<AuthState> {
        // Backend expects password, but frontend removed it. 
        // We will send a default or handle "passwordless" flow if backend was updated.
        // For now, assuming backend still expects password, we send a default dummy for the "email only" flow.
        // Ideally backend should have been 'passwordless' fully, but sending default matches previous mock logic.
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: 'default123' })
        });

        if (!res.ok) throw new Error('Falha no login');
        return res.json();
    },

    async register(name: string, email: string): Promise<AuthState> {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password: 'default123' })
        });

        if (!res.ok) throw new Error('Falha no cadastro');
        return res.json();
    },

    // Sites
    async getSites(): Promise<Site[]> {
        const res = await fetch(`${API_URL}/sites`);
        if (!res.ok) throw new Error('Falha ao buscar sites');
        return res.json();
    },

    // Credentials
    async getCredentials(): Promise<Credential[]> {
        const res = await fetch(`${API_URL}/credentials`, {
            headers: getHeaders()
        });
        if (!res.ok) throw new Error('Falha ao buscar credenciais');
        return res.json();
    },

    async saveCredential(siteId: string, login: string, pass: string): Promise<Credential> {
        const res = await fetch(`${API_URL}/credentials`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ site_id: siteId, login, password: pass })
        });
        if (!res.ok) throw new Error('Falha ao salvar credencial');
        return res.json();
    },

    async updateCredential(id: string, login: string, pass: string): Promise<Credential> {
        const res = await fetch(`${API_URL}/credentials/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ login, password: pass })
        });
        if (!res.ok) throw new Error('Falha ao atualizar credencial');
        return res.json();
    }
};
