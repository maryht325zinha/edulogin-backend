
import { Site } from './types';

export const INITIAL_SITES: Site[] = [
  {
    id: '1',
    name: 'Atendimento Prodabel',
    url: 'https://atendimentoprodabel.pbh.gov.br/CAisd/pdmweb.exe',
    icon: '🔧',
    description: 'Sistema de chamados e atendimento técnico.'
  },
  {
    id: 'canva-edu',
    name: 'Canva for Education',
    url: 'https://www.canva.com/education/',
    icon: '🎨',
    description: 'Ferramenta de design gráfico para professores.'
  },
  {
    id: 'local-pc',
    name: 'Login do Windows (PC)',
    url: '',
    icon: '🖥️',
    description: 'Senha utilizada para acessar os computadores da escola.'
  }
];

export const STORAGE_KEYS = {
  USERS: 'edupass_users',
  CREDENTIALS: 'edupass_credentials',
  SESSION: 'edupass_session',
  THEME: 'edupass_theme'
};
