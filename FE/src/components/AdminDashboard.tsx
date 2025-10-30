import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { ArrowLeft, Plus, Copy, Check, Key } from 'lucide-react';
import { mockApi } from '../lib/mockApi';

interface AdminDashboardProps {
  adminToken: string;
  onLogout: () => void;
}

export function AdminDashboard({ adminToken, onLogout }: AdminDashboardProps) {
  const [tokens, setTokens] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateToken = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await mockApi.generateToken(adminToken);
      setTokens([response.token_string, ...tokens]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat token');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (token: string, index: number) => {
    try {
      await navigator.clipboard.writeText(token);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={onLogout}
            className="text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Logout
          </Button>
          <h1 className="text-white text-2xl">Admin Dashboard</h1>
          <div className="w-24"></div>
        </div>

        {/* Generate Token Card */}
        <Card className="bg-slate-800/50 border-slate-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Key className="w-5 h-5" />
              Generate Token Akses
            </CardTitle>
            <CardDescription className="text-slate-300">
              Buat token baru untuk memberikan akses terminal kepada murid
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={generateToken}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              {loading ? 'Membuat Token...' : 'Generate Token Baru'}
            </Button>
          </CardContent>
        </Card>

        {/* Tokens List */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Token yang Dibuat ({tokens.length})</CardTitle>
            <CardDescription className="text-slate-300">
              Daftar token yang telah di-generate. Salin dan bagikan kepada murid.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tokens.length === 0 ? (
              <div className="text-center py-12">
                <Key className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">Belum ada token yang dibuat</p>
                <p className="text-sm text-slate-500 mt-1">
                  Klik tombol "Generate Token Baru" untuk membuat token pertama
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {tokens.map((token, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center">
                        <Key className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white font-mono">{token}</p>
                        <p className="text-xs text-slate-500">
                          Dibuat: {new Date().toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(token, index)}
                      className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
                    >
                      {copiedIndex === index ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Tersalin
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Salin
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info */}
        <div className="mt-6 p-4 bg-slate-800/30 rounded-lg border border-slate-700">
          <h3 className="text-white mb-2">Informasi</h3>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>• Setiap token hanya dapat digunakan sekali</li>
            <li>• Token yang sudah digunakan akan otomatis ditandai</li>
            <li>• Maksimal 3 sesi bersamaan dapat berjalan</li>
            <li>• Setiap sesi berlangsung maksimal 1 jam</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
