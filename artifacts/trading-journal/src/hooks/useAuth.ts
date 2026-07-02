import { useState, useCallback } from "react";

const USERS_KEY = "tradelog-users";
const SESSION_KEY = "tradelog-session";

interface StoredUser {
  username: string;
  password: string;
}

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  } catch {
    return [];
  }
}

function readSession(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<string | null>(readSession);

  const signUp = useCallback(
    (username: string, password: string): { ok: boolean; error?: string } => {
      const trimmed = username.trim();
      if (!trimmed) return { ok: false, error: "Username is required." };
      if (password.length < 4) return { ok: false, error: "Password must be at least 4 characters." };

      const users = readUsers();
      if (users.find(u => u.username.toLowerCase() === trimmed.toLowerCase())) {
        return { ok: false, error: "Username already taken." };
      }

      users.push({ username: trimmed, password });
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      localStorage.setItem(SESSION_KEY, trimmed);
      setCurrentUser(trimmed);
      return { ok: true };
    },
    []
  );

  const logIn = useCallback(
    (username: string, password: string): { ok: boolean; error?: string } => {
      const trimmed = username.trim();
      const users = readUsers();
      const match = users.find(
        u => u.username.toLowerCase() === trimmed.toLowerCase() && u.password === password
      );
      if (!match) return { ok: false, error: "Invalid username or password." };

      localStorage.setItem(SESSION_KEY, match.username);
      setCurrentUser(match.username);
      return { ok: true };
    },
    []
  );

  const logOut = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
  }, []);

  return { currentUser, signUp, logIn, logOut };
}
