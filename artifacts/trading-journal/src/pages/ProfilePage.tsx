import { useState } from "react";
import { User, Mail, Lock, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function ProfilePage() {
  const { user, changePassword, updateDisplayName } = useAuth();

  const email = user?.email ?? "";
  const currentDisplayName = (user?.user_metadata?.display_name as string | undefined) ?? email.split("@")[0];

  const [displayName, setDisplayName] = useState(currentDisplayName);
  const [nameSuccess, setNameSuccess] = useState("");
  const [nameError, setNameError] = useState("");
  const [nameSaving, setNameSaving] = useState(false);

  const [pwOpen, setPwOpen] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  if (!user) return null;

  const initials = currentDisplayName
    .split(/[\s._-]/)
    .map(p => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError("");
    setNameSuccess("");
    if (!displayName.trim()) { setNameError("Display name cannot be empty."); return; }
    setNameSaving(true);
    const res = await updateDisplayName(displayName.trim());
    setNameSaving(false);
    if (!res.ok) { setNameError(res.error ?? "Error"); return; }
    setNameSuccess("Display name updated.");
    setTimeout(() => setNameSuccess(""), 3000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");
    if (newPw !== confirmPw) { setPwError("Passwords do not match."); return; }
    if (newPw.length < 6) { setPwError("Password must be at least 6 characters."); return; }
    setPwSaving(true);
    const res = await changePassword(newPw);
    setPwSaving(false);
    if (!res.ok) { setPwError(res.error ?? "Error"); return; }
    setPwSuccess("Password changed successfully.");
    setNewPw("");
    setConfirmPw("");
    setTimeout(() => { setPwSuccess(""); setPwOpen(false); }, 3000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Profile</h1>

      {/* Avatar + summary */}
      <div className="flex items-center gap-5 mb-8 p-6 bg-card border border-border rounded-xl">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold flex-shrink-0">
          {initials}
        </div>
        <div>
          <p className="text-lg font-semibold">{currentDisplayName}</p>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl divide-y divide-border">

        {/* Email (read-only) */}
        <div className="px-6 py-5 flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
            <Mail className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-0.5">Email</p>
            <p className="text-sm font-medium truncate">{email}</p>
          </div>
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">Read-only</span>
        </div>

        {/* Display name */}
        <div className="px-6 py-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Display Name</p>
              <p className="text-sm font-medium">{currentDisplayName}</p>
            </div>
          </div>

          <form onSubmit={handleSaveName} className="flex gap-3">
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Your display name"
              className="flex-1 bg-secondary border border-border rounded-md px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
            />
            <button
              type="submit"
              disabled={nameSaving}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {nameSaving ? "Saving…" : "Save"}
            </button>
          </form>

          {nameSuccess && (
            <p className="flex items-center gap-1.5 text-xs text-green-400 mt-2">
              <CheckCircle className="w-3.5 h-3.5" /> {nameSuccess}
            </p>
          )}
          {nameError && (
            <p className="flex items-center gap-1.5 text-xs text-destructive mt-2">
              <AlertCircle className="w-3.5 h-3.5" /> {nameError}
            </p>
          )}
        </div>

        {/* Change password */}
        <div className="px-6 py-5">
          <button
            onClick={() => { setPwOpen(o => !o); setPwError(""); setPwSuccess(""); }}
            className="flex items-center justify-between w-full group"
          >
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                <Lock className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-left">
                <p className="text-xs text-muted-foreground mb-0.5">Password</p>
                <p className="text-sm font-medium">Change password</p>
              </div>
            </div>
            {pwOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>

          {pwOpen && (
            <form onSubmit={handleChangePassword} className="mt-5 flex flex-col gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">New password</label>
                <input
                  type="password"
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  autoComplete="new-password"
                  className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Confirm new password</label>
                <input
                  type="password"
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  placeholder="Repeat new password"
                  required
                  autoComplete="new-password"
                  className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
              </div>

              {pwError && <p className="flex items-center gap-1.5 text-xs text-destructive"><AlertCircle className="w-3.5 h-3.5" /> {pwError}</p>}
              {pwSuccess && <p className="flex items-center gap-1.5 text-xs text-green-400"><CheckCircle className="w-3.5 h-3.5" /> {pwSuccess}</p>}

              <button
                type="submit"
                disabled={pwSaving}
                className="self-start px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {pwSaving ? "Updating…" : "Update Password"}
              </button>
            </form>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground/50 text-center mt-6">
        Account managed securely via Supabase Auth.
      </p>
    </div>
  );
}
