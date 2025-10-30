import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Terminal, Server, Users, Clock } from 'lucide-react';
import { mockApi } from '../lib/mockApi';

interface StatusPageProps {
  onTokenSubmit: (token: string) => void;
  onAdminClick: () => void;
}

export function StatusPage({ onTokenSubmit, onAdminClick }: StatusPageProps) {
  const [token, setToken] = useState('');
  const [serverStatus, setServerStatus] = useState<'AKTIF' | 'TIDAK AKTIF' | 'LOADING'>('LOADING');
  const [activeSessions, setActiveSessions] = useState(0);
  const [maxSessions, setMaxSessions] = useState(3);
  const [error, setError] = useState('');

  useEffect(() => {
    checkServerStatus();
    const interval = setInterval(checkServerStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const checkServerStatus = async () => {
    try {
      const status = await mockApi.getStatus();
      setServerStatus(status.status);
      setActiveSessions(status.active_sessions || 0);
      setMaxSessions(status.max_sessions || 3);
    } catch (err) {
      setServerStatus('TIDAK AKTIF');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token.trim()) {
      setError('Silakan masukkan token akses');
      return;
    }

    if (activeSessions >= maxSessions) {
      setError('Server penuh. Silakan coba lagi nanti.');
      return;
    }

    onTokenSubmit(token.trim());
  };

  const sessionsAvailable = maxSessions - activeSessions;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Terminal className="w-12 h-12 text-green-400" />
            <h1 className="text-white text-4xl">Simulasi Terminal Linux</h1>
          </div>
          <p className="text-slate-300">Platform Pelatihan Interaktif Berbasis Web</p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Server className={`w-8 h-8 ${serverStatus === 'AKTIF' ? 'text-green-400' : 'text-red-400'}`} />
                <div>
                  <p className="text-slate-400">Status Server</p>
                  <p className={`text-lg ${serverStatus === 'AKTIF' ? 'text-green-400' : 'text-red-400'}`}>
                    {serverStatus === 'LOADING' ? 'Memeriksa...' : serverStatus}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-slate-400">Sesi Aktif</p>
                  <p className="text-lg text-white">{activeSessions} / {maxSessions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-slate-400">Durasi Sesi</p>
                  <p className="text-lg text-white">1 Jam</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Token Input Card */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Akses Terminal</CardTitle>
            <CardDescription className="text-slate-300">
              Masukkan token akses untuk memulai sesi terminal Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Contoh: LAB-A1B2-C3D4"
                  value={token}
                  onChange={(e) => setToken(e.target.value.toUpperCase())}
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                  disabled={serverStatus !== 'AKTIF'}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {serverStatus === 'AKTIF' && sessionsAvailable === 0 && (
                <Alert>
                  <AlertDescription className="text-yellow-600">
                    Server penuh ({maxSessions}/{maxSessions} sesi). Silakan tunggu hingga ada slot tersedia.
                  </AlertDescription>
                </Alert>
              )}

              {serverStatus === 'TIDAK AKTIF' && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Server simulasi sedang offline. Silakan hubungi administrator.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={serverStatus !== 'AKTIF' || sessionsAvailable === 0}
                >
                  Mulai Sesi Terminal
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onAdminClick}
                  className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
                >
                  Admin
                </Button>
              </div>
            </form>

            {serverStatus === 'AKTIF' && sessionsAvailable > 0 && (
              <p className="text-sm text-slate-400 mt-4 text-center">
                {sessionsAvailable} slot tersedia
              </p>
            )}
          </CardContent>
        </Card>

        {/* Info */}
        <div className="mt-6 text-center text-slate-400 text-sm">
          <p>Simulasi Terminal Linux v0.2 - Platform MERN Stack dengan Docker</p>
        </div>
      </div>
    </div>
  );
}
