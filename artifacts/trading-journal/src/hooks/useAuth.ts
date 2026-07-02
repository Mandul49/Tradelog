import { useState, useCallback } from "react";

const USERS_KEY = "tradelog-users";
const SESSION_KEY = "tradelog-session";

export interface StoredUser {
  email: string;
  username: string;
  password: string;
}

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredUser[];
    return parsed.map(u => ({
      email: u.email ?? (u as unknown as Record<string, string>)["username"] ?? "",
      username: u.username ?? u.email?.split("@")[0] ?? "user",
      password: u.password,
    }));
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function readSession(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

function isValidEmail(val: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

export function useAuth() {
  const [currentEmail, setCurrentEmail] = useState<string | null>(readSession);

  const currentUser: StoredUser | null =
    currentEmail ? (readUsers().find(u => u.email.toLowerCase() === currentEmail.toLowerCase()) ?? null) : null;

  const signUp = useCallback(
    (email: string, password: string): { ok: boolean; error?: string } => {
      const trimmed = email.trim().toLowerCase();
      if (!isValidEmail(trimmed)) return { ok: false, error: "Please enter a valid email address." };
      if (password.length < 4) return { ok: false, error: "Password must be at least 4 characters." };

      const users = readUsers();
      if (users.find(u => u.email.toLowerCase() === trimmed)) {
        return { ok: false, error: "An account with this email already exists." };
      }

      const username = trimmed.split("@")[0];
      const newUser: StoredUser = { email: trimmed, username, password };
      users.push(newUser);
      writeUsers(users);
      localStorage.setItem(SESSION_KEY, trimmed);
      setCurrentEmail(trimmed);
      return { ok: true };
    },
    []
  );

  const logIn = useCallback(
    (email: string, password: string): { ok: boolean; error?: string } => {
      const trimmed = email.trim().toLowerCase();
      const users = readUsers();
      const match = users.find(u => u.email.toLowerCase() === trimmed && u.password === password);
      if (!match) return { ok: false, error: "Invalid email or password." };

      localStorage.setItem(SESSION_KEY, match.email);
      setCurrentEmail(match.email);
      return { ok: true };
    },
    []
  );

  const logOut = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setCurrentEmail(null);
  }, []);

  const changePassword = useCallback(
    (currentPassword: string, newPassword: string): { ok: boolean; error?: string } => {
      if (!currentEmail) return { ok: false, error: "Not logged in." };
      if (newPassword.length < 4) return { ok: false, error: "New password must be at least 4 characters." };

      const users = readUsers();
      const idx = users.findIndex(u => u.email.toLowerCase() === currentEmail.toLowerCase());
      if (idx === -1) return { ok: false, error: "Account not found." };
      if (users[idx].password !== currentPassword) return { ok: false, error: "Current password is incorrect." };

      users[idx].password = newPassword;
      writeUsers(users);
      return { ok: true };
    },
    [currentEmail]
  );

  const updateUsername = useCallback(
    (newUsername: string): { ok: boolean; error?: string } => {
      const trimmed = newUsername.trim();
      if (!trimmed) return { ok: false, error: "Display name cannot be empty." };
      if (!currentEmail) return { ok: false, error: "Not logged in." };

      const users = readUsers();
      const idx = users.findIndex(u => u.email.toLowerCase() === currentEmail.toLowerCase());
      if (idx === -1) return { ok: false, error: "Account not found." };

      users[idx].username = trimmed;
      writeUsers(users);
      setCurrentEmail(prev => prev); // trigger re-render
      return { ok: true };
    },
    [currentEmail]
  );

  return { currentEmail, currentUser, signUp, logIn, logOut, changePassword, updateUsername };
}
