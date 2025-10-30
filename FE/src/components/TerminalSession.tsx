import { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { X, Clock, Server, AlertCircle } from 'lucide-react';
import { MockSocket } from '../lib/mockSocket';
import { mockApi } from '../lib/mockApi';

interface TerminalSessionProps {
  token: string;
  onExit: () => void;
}

export function TerminalSession({ token, onExit }: TerminalSessionProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminal = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const socket = useRef<MockSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'failed'>('connecting');
  const [errorMessage, setErrorMessage] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(3600); // 1 hour in seconds
  const sessionStartTime = useRef<number>(Date.now());

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize terminal
    terminal.current = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#0f172a',
        foreground: '#e2e8f0',
        cursor: '#22d3ee',
        black: '#1e293b',
        red: '#ef4444',
        green: '#22c55e',
        yellow: '#eab308',
        blue: '#3b82f6',
        magenta: '#a855f7',
        cyan: '#22d3ee',
        white: '#f1f5f9',
        brightBlack: '#475569',
        brightRed: '#f87171',
        brightGreen: '#4ade80',
        brightYellow: '#facc15',
        brightBlue: '#60a5fa',
        brightMagenta: '#c084fc',
        brightCyan: '#67e8f9',
        brightWhite: '#ffffff',
      },
      rows: 30,
      cols: 100,
    });

    fitAddon.current = new FitAddon();
    terminal.current.loadAddon(fitAddon.current);
    terminal.current.open(terminalRef.current);
    fitAddon.current.fit();

    // Initialize socket
    socket.current = new MockSocket();

    // Socket event handlers
    socket.current.on('connect', () => {
      console.log('Socket connected, authenticating...');
      socket.current!.authenticate(token);
    });

    socket.current.on('auth-success', () => {
      setConnectionStatus('connected');
      mockApi.incrementSessions();
    });

    socket.current.on('auth-fail', (message: string) => {
      setConnectionStatus('failed');
      setErrorMessage(message);
    });

    socket.current.on('terminal-output', (data: string) => {
      terminal.current?.write(data);
    });

    socket.current.on('clear-terminal', () => {
      terminal.current?.clear();
    });

    socket.current.on('session-end', (message: string) => {
      terminal.current?.write(`\r\n\r\n${message}\r\n`);
      setTimeout(() => {
        handleExit();
      }, 3000);
    });

    // Terminal input handler
    terminal.current.onData((data) => {
      socket.current?.sendInput(data);
    });

    // Connect socket
    socket.current.connect();

    // Timer for session duration
    const timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionStartTime.current) / 1000);
      const remaining = Math.max(0, 3600 - elapsed);
      setTimeRemaining(remaining);

      if (remaining === 0) {
        socket.current?.emit('session-end', 'Waktu sesi Anda telah habis (1 jam). Koneksi akan ditutup.');
        clearInterval(timerInterval);
      }
    }, 1000);

    // Handle window resize
    const handleResize = () => {
      fitAddon.current?.fit();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      clearInterval(timerInterval);
      window.removeEventListener('resize', handleResize);
      socket.current?.disconnect();
      terminal.current?.dispose();
      mockApi.decrementSessions();
      mockApi.useToken(token);
    };
  }, [token]);

  const handleExit = () => {
    socket.current?.disconnect();
    onExit();
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Card className="bg-slate-800/50 border-slate-700 mb-4">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Server className="w-5 h-5 text-green-400" />
                Terminal Linux - Sesi Aktif
              </CardTitle>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-slate-300">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono">{formatTime(timeRemaining)}</span>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleExit}
                >
                  <X className="w-4 h-4 mr-2" />
                  Akhiri Sesi
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Connection Status */}
        {connectionStatus === 'connecting' && (
          <Alert className="mb-4 bg-blue-900/30 border-blue-700">
            <AlertCircle className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-200">
              Menghubungkan ke server dan membuat container...
            </AlertDescription>
          </Alert>
        )}

        {connectionStatus === 'failed' && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {errorMessage || 'Gagal terhubung ke server. Silakan coba lagi.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Terminal */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div
              ref={terminalRef}
              className="rounded-lg overflow-hidden"
              style={{ height: 'calc(100vh - 250px)', minHeight: '500px' }}
            />
          </CardContent>
        </Card>

        {/* Info */}
        {connectionStatus === 'connected' && (
          <div className="mt-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700">
            <p className="text-sm text-slate-300">
              💡 <strong>Tips:</strong> Ketik "help" untuk melihat perintah yang tersedia. 
              Sesi ini akan otomatis berakhir setelah 1 jam atau saat Anda menutup tab browser.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
