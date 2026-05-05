import { useState, useEffect } from "react";
import { User, Mail, Save, Upload, X, Download, Loader2 } from "lucide-react";
import { useDatabaseAdapter } from "@/services/database/DatabaseProvider";

export function ProfileSettings() {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [uuid, setUuid] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const db = useDatabaseAdapter();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    if (!db) return;
    const settings = await db.getProfileSettings();
    if (settings) {
      setDisplayName(settings.displayName || "");
      setEmail(settings.email || "");
      setAvatar(settings.avatar || "");
    }
    
    // Also load username and UUID from sessionStorage since we drop user object fetch
    const sessionUsername = sessionStorage.getItem("cc_username");
    const sessionUuid = sessionStorage.getItem("cc_user_uuid");
    
    if (sessionUsername) {
      setUsername(sessionUsername);
    }
    if (sessionUuid) {
      setUuid(sessionUuid);
    }
  };

  const handleSaveProfile = async () => {
    if (!db) return;
    setIsSaving(true);
    setSaveMessage("");

    try {
      await db.saveProfileSettings({
        username,
        displayName,
        email,
        avatar,
      });
      setSaveMessage("Profile updated successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      setSaveMessage("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar("");
  };

  return (
    <div className="space-y-6">
      {/* Profile Settings Block */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-cyan-500/30 dark:border-cyan-500/50 shadow-sm transition-colors">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-semibold leading-none tracking-tight text-cyan-600 dark:text-cyan-400 mb-1.5">Profile Settings</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your lobster identity and preferences</p>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center overflow-hidden border-4 border-cyan-600 shadow-lg flex-shrink-0 transition-transform group-hover:scale-105">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </div>
              {avatar && (
                <button
                  onClick={handleRemoveAvatar}
                  className="absolute -top-1 -right-1 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all shadow-md active:scale-90"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            
            <div className="flex-1 w-full space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Avatar Image</label>
                <div className="flex gap-2 mt-1.5">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="flex h-10 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  />
                  <div className="flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-500 dark:text-slate-400">
                    <Upload className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium italic">
                  Recommended: Square image, at least 200x200px
                </p>
              </div>
            </div>
          </div>

          {/* Profile Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Username</label>
              <input
                type="text"
                value={username}
                readOnly
                className="mt-1.5 flex h-10 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 px-3 py-2 text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed font-medium"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 italic font-medium">
                Your unique handle in the reef (cannot be changed after setup)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How others see you"
                className="mt-1.5 flex h-10 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address (Optional)</label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="lobster@clawchives.io"
                className="flex h-10 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="min-h-[20px]">
              {saveMessage && (
                <span className={`text-sm font-bold animate-in fade-in slide-in-from-left-2 ${saveMessage.includes("success") ? "text-green-600" : "text-red-600"}`}>
                  {saveMessage}
                </span>
              )}
            </div>
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="inline-flex items-center justify-center px-6 py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white text-sm font-black uppercase tracking-widest rounded-xl shadow-lg shadow-cyan-600/20 active:scale-95 transition-all disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* Account Info Block */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-cyan-500/30 dark:border-cyan-500/50 shadow-sm transition-colors overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <h3 className="text-lg font-semibold text-cyan-600 dark:text-cyan-400">Account Information</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4 text-sm font-medium">
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/50">
              <span className="text-slate-600 dark:text-slate-400">Account Type</span>
              <span className="text-slate-900 dark:text-slate-100 font-bold">Personal Habitat</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/50">
              <span className="text-slate-600 dark:text-slate-400">Storage Engine</span>
              <span className="text-slate-900 dark:text-slate-100 font-bold">Local (ShellCrypted©™)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/50">
              <span className="text-slate-600 dark:text-slate-400">UUID</span>
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{uuid || "N/A"}</span>
            </div>
            
            <div className="pt-4">
              <button
                className="w-full inline-flex items-center justify-center gap-3 px-4 py-3 border-2 border-cyan-500/50 text-cyan-700 dark:text-cyan-400 font-bold rounded-xl hover:bg-cyan-50 dark:hover:bg-cyan-900/20 active:scale-[0.98] transition-all"
                onClick={() => {
                  const identity = sessionStorage.getItem("cc_identity");
                  if (identity) {
                    const blob = new Blob([identity], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "clawchives_identity_key.json";
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  } else {
                    alert("No identity found. Are you logged in?");
                  }
                }}
              >
                <Download className="w-4 h-4" />
                Download Identity Key
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}