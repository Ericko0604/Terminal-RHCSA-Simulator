// Mock Socket.io implementation for terminal simulation

type EventHandler = (...args: any[]) => void;

export class MockSocket {
  private handlers: Map<string, EventHandler[]> = new Map();
  private connected = false;
  private terminalProcess: NodeJS.Timeout | null = null;

  connect() {
    this.connected = true;
    setTimeout(() => {
      this.emit('connect');
    }, 500);
  }

  on(event: string, handler: EventHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
  }

  emit(event: string, ...args: any[]) {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(...args));
    }
  }

  disconnect() {
    this.connected = false;
    if (this.terminalProcess) {
      clearTimeout(this.terminalProcess);
    }
    this.emit('disconnect');
  }

  // Simulate authentication
  authenticate(token: string) {
    setTimeout(() => {
      // Simulate server validation
      if (token.startsWith('LAB-')) {
        this.emit('auth-success');
        this.startTerminalSimulation();
      } else {
        this.emit('auth-fail', 'Token tidak valid atau sudah digunakan');
      }
    }, 1000);
  }

  // Simulate terminal I/O
  sendInput(data: string) {
    if (!this.connected) return;
    
    // Echo the input back (simulating terminal behavior)
    setTimeout(() => {
      this.emit('terminal-output', data);
      
      // Simulate command responses
      if (data.includes('\r')) {
        this.handleCommand(data.replace('\r', '').trim());
      }
    }, 50);
  }

  private handleCommand(command: string) {
    if (!command) {
      this.emit('terminal-output', '\r\nstudent@lab:~$ ');
      return;
    }

    setTimeout(() => {
      let output = '\r\n';
      
      switch (command) {
        case 'ls':
          output += 'Desktop  Documents  Downloads  lab.sh  Music  Pictures  Videos\r\n';
          break;
        case 'pwd':
          output += '/home/student\r\n';
          break;
        case 'whoami':
          output += 'student\r\n';
          break;
        case 'date':
          output += new Date().toString() + '\r\n';
          break;
        case 'help':
          output += 'Available commands: ls, pwd, whoami, date, help, clear, uname, lab\r\n';
          break;
        case 'clear':
          this.emit('clear-terminal');
          return;
        case 'uname -a':
        case 'uname':
          output += 'Linux lab 5.15.0-1 #1 SMP Ubuntu x86_64 GNU/Linux\r\n';
          break;
        case 'lab':
          output += 'Lab Management Tool v1.0\r\n';
          output += 'Usage: lab [start|end|status]\r\n';
          break;
        case 'lab status':
          output += 'Lab Status: Active\r\n';
          output += 'Session Time Remaining: 58 minutes\r\n';
          break;
        default:
          output += `bash: ${command}: command not found\r\n`;
      }
      
      output += 'student@lab:~$ ';
      this.emit('terminal-output', output);
    }, 100);
  }

  private startTerminalSimulation() {
    // Send initial terminal output
    setTimeout(() => {
      const welcomeMessage = '\r\nWelcome to Linux Terminal Simulation Lab\r\n';
      const info = 'Ubuntu 22.04 LTS - Session Duration: 1 hour\r\n';
      const separator = '='.repeat(50) + '\r\n';
      const helpText = 'Type "help" for available commands\r\n\r\n';
      const prompt = 'student@lab:~$ ';
      
      this.emit('terminal-output', welcomeMessage + info + separator + helpText + prompt);
    }, 500);
  }

  isConnected() {
    return this.connected;
  }
}
