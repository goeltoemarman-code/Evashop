import React, { useState } from 'react';
import { 
  X, Key, CheckCircle2, ShieldCheck, AlertCircle, RefreshCw, 
  ExternalLink, LogOut, Check, Globe 
} from 'lucide-react';
import { BloggerAuth, BloggerBlog } from '../../types/affiliate';
import { fetchUserBlogs } from '../../services/bloggerApi';

interface BloggerConnectModalProps {
  bloggerAuth: BloggerAuth;
  onUpdateBloggerAuth: (newAuth: BloggerAuth) => void;
  onClose: () => void;
}

export const BloggerConnectModal: React.FC<BloggerConnectModalProps> = ({
  bloggerAuth,
  onUpdateBloggerAuth,
  onClose,
}) => {
  const [tokenInput, setTokenInput] = useState(bloggerAuth.accessToken || '');
  const [clientIdInput, setClientIdInput] = useState(bloggerAuth.clientId || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [blogsList, setBlogsList] = useState<BloggerBlog[]>(bloggerAuth.blogs || []);
  const [selectedBlogId, setSelectedBlogId] = useState<string>(
    bloggerAuth.selectedBlog?.id || (bloggerAuth.blogs?.[0]?.id ?? '')
  );

  // Connect via Google OAuth Token Client (GIS) or direct access token
  const handleConnectWithToken = async (tokenToUse?: string) => {
    const token = (tokenToUse || tokenInput).trim();
    if (!token) {
      setErrorMessage('Silakan masukkan Google Access Token atau gunakan Google Sign-In.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const fetchedBlogs = await fetchUserBlogs(token);

      if (fetchedBlogs.length === 0) {
        throw new Error('Akun Google ini belum memiliki Blog di Blogger. Silakan buat blog terlebih dahulu di blogger.com.');
      }

      const activeBlog = fetchedBlogs.find(b => b.id === selectedBlogId) || fetchedBlogs[0];

      onUpdateBloggerAuth({
        isConnected: true,
        accessToken: token,
        selectedBlog: activeBlog,
        blogs: fetchedBlogs,
        error: null,
        clientId: clientIdInput.trim() || undefined,
      });

      setBlogsList(fetchedBlogs);
      setSelectedBlogId(activeBlog.id);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memverifikasi akun Blogger.');
    } finally {
      setIsLoading(false);
    }
  };

  // Google Identity Services (GSI) Token Client popup
  const handleGoogleSignInPopup = () => {
    const clientId = clientIdInput.trim();
    if (!clientId) {
      setErrorMessage('Silakan isi Google OAuth Client ID terlebih dahulu, atau gunakan metode tempel Access Token di bawah.');
      return;
    }

    // Check if google accounts script is loaded
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
      try {
        const client = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/blogger',
          callback: (response: any) => {
            if (response.error) {
              setErrorMessage(`Google Login Error: ${response.error}`);
              return;
            }
            if (response.access_token) {
              setTokenInput(response.access_token);
              handleConnectWithToken(response.access_token);
            }
          },
        });
        client.requestAccessToken();
      } catch (e: any) {
        setErrorMessage(`Inisialisasi Google OAuth gagal: ${e.message}`);
      }
    } else {
      setErrorMessage('Google Identity Service sedang dimuat. Jika tidak muncul, Anda bisa langsung menempelkan Google Access Token di kolom bawah.');
    }
  };

  const handleSelectBlogChange = (newBlogId: string) => {
    setSelectedBlogId(newBlogId);
    const blog = blogsList.find(b => b.id === newBlogId) || null;
    if (blog && bloggerAuth.accessToken) {
      onUpdateBloggerAuth({
        ...bloggerAuth,
        selectedBlog: blog,
      });
    }
  };

  const handleDisconnect = () => {
    onUpdateBloggerAuth({
      isConnected: false,
      accessToken: null,
      selectedBlog: null,
      blogs: [],
      error: null,
      clientId: clientIdInput,
    });
    setTokenInput('');
    setBlogsList([]);
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                22. Google Login Blogger
              </h2>
              <p className="text-xs text-slate-500">
                Koneksi resmi Google OAuth untuk menyimpan draft artikel.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-4 text-xs">
          {/* Security Banner: Strict Compliance */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-emerald-900">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>23. Keamanan Terjamin:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-emerald-800">
              Eva Shop tidak pernah meminta dan tidak menyimpan password akun Google / Blogger Anda. 
              Koneksi hanya menggunakan izin resmi Google OAuth scope minimum (Blogger API).
            </p>
          </div>

          {/* Connection Status View */}
          {bloggerAuth.isConnected ? (
            <div className="p-4 bg-emerald-50/70 border border-emerald-300 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-emerald-950 text-sm">
                    🟢 Blogger Terhubung
                  </span>
                </div>

                <button
                  onClick={handleDisconnect}
                  type="button"
                  className="flex items-center gap-1 text-rose-600 hover:text-rose-800 font-bold text-[11px] bg-white px-2 py-1 rounded border border-rose-200"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Putuskan Koneksi</span>
                </button>
              </div>

              {/* Blog Selection */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Pilih Blog Tujuan Simpan Draft:
                </label>
                <select
                  value={selectedBlogId}
                  onChange={(e) => handleSelectBlogChange(e.target.value)}
                  className="w-full p-2.5 bg-white border border-emerald-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  {bloggerAuth.blogs.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} (ID: {b.id})
                    </option>
                  ))}
                </select>
              </div>

              {bloggerAuth.selectedBlog && (
                <div className="text-[11px] text-slate-600 space-y-0.5 pt-1">
                  <div>Nama Blog: <strong className="text-slate-800">{bloggerAuth.selectedBlog.name}</strong></div>
                  <div>URL Blog: <a href={bloggerAuth.selectedBlog.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">{bloggerAuth.selectedBlog.url}</a></div>
                </div>
              )}
            </div>
          ) : (
            /* Connection Setup Options */
            <div className="space-y-4">
              {/* Option A: Google Identity Client ID */}
              <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="font-bold text-slate-800 block text-xs">
                  Opsi 1: Google OAuth Client ID (Disarankan):
                </label>
                <input
                  type="text"
                  value={clientIdInput}
                  onChange={(e) => setClientIdInput(e.target.value)}
                  placeholder="Contoh: 123456789-abc.apps.googleusercontent.com"
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                />
                <button
                  onClick={handleGoogleSignInPopup}
                  type="button"
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold rounded-lg transition-colors shadow-2xs"
                >
                  <img 
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                    alt="Google" 
                    className="w-4 h-4" 
                  />
                  <span>🔐 Masuk dengan Google &amp; Hubungkan Blogger</span>
                </button>
              </div>

              {/* Option B: Direct Access Token (Instant for testing) */}
              <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 block text-xs">
                    Opsi 2: Tempel Google OAuth Access Token:
                  </label>
                  <a
                    href="https://developers.google.com/oauthplayground/#step1&apisSelect=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fblogger"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-0.5 text-[10px]"
                  >
                    <span>Ambil Token (OAuth Playground)</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>

                <input
                  type="password"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Tempel Access Token Google Blogger (ya29....)"
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                />

                <button
                  onClick={() => handleConnectWithToken()}
                  disabled={isLoading || !tokenInput}
                  type="button"
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Verifikasi &amp; Hubungkan Blog</span>
                </button>
              </div>
            </div>
          )}

          {/* Error Message if any */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block">Gagal Terhubung:</strong>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <div className="text-slate-400 text-[11px]">
            Hanya izin draft yang digunakan (Strict Draft-Only Mode).
          </div>

          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
