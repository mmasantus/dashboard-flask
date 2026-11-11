/**
 * Security and persistence utility for Administrator Password
 * and Experiência Brasil team members management.
 */

export const ADMIN_NAME = "Marcio Miranda Alves dos Santos";
export const ADMIN_EMAIL = "eumarciomirandanovo@gmail.com";

export const DEFAULT_EQUIPE: string[] = [
  "RAFAELLA CRISTINY JACINTO CAMILO",
  "VANESSA DUARTE",
  "MARCIO MIRANDA ALVES DOS SANTOS",
  "WILLIANE BORGES",
  "LUIS GUILHERME TEODORO DOS SANTOS",
  "ADRIANA CONCEICAO DE OLIVEIRA",
  "DANIELA COELHO"
];

const STORAGE_KEY_TEAM = 'mktzap_equipe_experiencia_brasil';
const STORAGE_KEY_ADMIN_HASH = 'mktzap_admin_password_hash_v1';
const STORAGE_KEY_ADMIN_SALT = 'mktzap_admin_password_salt_v1';
const STORAGE_KEY_ADMIN_SESSION = 'mktzap_admin_session_auth';

// Helper: SHA-256 hash using browser native Web Crypto API
async function sha256(message: string, salt: string = 'mktzap_salt_secure'): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Default initial password is 'admin123' if not yet defined
const INITIAL_DEFAULT_PASSWORD = 'admin123';

export async function initializeAdminPasswordIfNeeded(): Promise<void> {
  if (!localStorage.getItem(STORAGE_KEY_ADMIN_HASH)) {
    const defaultHash = await sha256(INITIAL_DEFAULT_PASSWORD);
    localStorage.setItem(STORAGE_KEY_ADMIN_HASH, defaultHash);
  }
}

export async function verifyAdminPassword(inputPassword: string): Promise<boolean> {
  await initializeAdminPasswordIfNeeded();
  const currentHash = localStorage.getItem(STORAGE_KEY_ADMIN_HASH);
  const inputHash = await sha256(inputPassword);
  return currentHash === inputHash;
}

export async function changeAdminPassword(oldPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  const isValid = await verifyAdminPassword(oldPassword);
  if (!isValid) {
    return { success: false, error: 'A senha atual de administrador está incorreta.' };
  }
  if (!newPassword || newPassword.trim().length < 4) {
    return { success: false, error: 'A nova senha deve ter no mínimo 4 caracteres.' };
  }
  const newHash = await sha256(newPassword.trim());
  localStorage.setItem(STORAGE_KEY_ADMIN_HASH, newHash);
  setAdminSession(true);
  return { success: true };
}

export function isDefaultPasswordInUse(): boolean {
  // Can be checked asynchronously if needed, or by flag
  return localStorage.getItem('mktzap_admin_custom_set') !== 'true';
}

export function setAdminSession(authenticated: boolean): void {
  if (authenticated) {
    const expiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes session
    sessionStorage.setItem(STORAGE_KEY_ADMIN_SESSION, JSON.stringify({ authenticated: true, expiresAt }));
  } else {
    sessionStorage.removeItem(STORAGE_KEY_ADMIN_SESSION);
  }
}

export function isAdminSessionValid(): boolean {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_ADMIN_SESSION);
    if (!raw) return false;
    const session = JSON.parse(raw);
    if (session?.authenticated && session?.expiresAt > Date.now()) {
      return true;
    }
    sessionStorage.removeItem(STORAGE_KEY_ADMIN_SESSION);
    return false;
  } catch {
    return false;
  }
}

export function getStoredTeam(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TEAM);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((name: unknown) => String(name).trim().toUpperCase());
      }
    }
  } catch (err) {
    console.error('Error loading team from storage:', err);
  }
  return [...DEFAULT_EQUIPE];
}

export function saveStoredTeam(team: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_TEAM, JSON.stringify(team));
  } catch (err) {
    console.error('Error saving team to storage:', err);
  }
}

export function resetTeamToDefault(): string[] {
  const def = [...DEFAULT_EQUIPE];
  saveStoredTeam(def);
  return def;
}
