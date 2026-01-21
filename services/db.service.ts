
import { User, Credential, Site } from '../types';
import { STORAGE_KEYS, INITIAL_SITES } from '../constants';

class DatabaseService {
  private static instance: DatabaseService;

  private constructor() {
    this.initialize();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private initialize() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CREDENTIALS)) {
      localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify([]));
    }
  }

  // Users
  getUsers(): User[] {
    const users = localStorage.getItem(STORAGE_KEYS.USERS);
    return users ? JSON.parse(users) : [];
  }

  saveUser(user: User): void {
    const users = this.getUsers();
    users.push(user);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  findUserByEmail(email: string): User | undefined {
    return this.getUsers().find(u => u.email === email);
  }

  // Sites
  getSites(): Site[] {
    return INITIAL_SITES;
  }

  // Credentials
  getCredentials(): Credential[] {
    const creds = localStorage.getItem(STORAGE_KEYS.CREDENTIALS);
    return creds ? JSON.parse(creds) : [];
  }

  saveCredential(credential: Credential): void {
    const creds = this.getCredentials();
    const index = creds.findIndex(c => c.userId === credential.userId && c.siteId === credential.siteId);
    
    if (index !== -1) {
      creds[index] = credential;
    } else {
      creds.push(credential);
    }
    
    localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(creds));
  }

  getUserCredentials(userId: string): Credential[] {
    return this.getCredentials().filter(c => c.userId === userId);
  }
}

export const db = DatabaseService.getInstance();
