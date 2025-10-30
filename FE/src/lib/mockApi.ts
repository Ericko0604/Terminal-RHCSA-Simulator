// Mock API service to simulate backend responses

interface StatusResponse {
  status: 'AKTIF' | 'TIDAK AKTIF';
  active_sessions?: number;
  max_sessions?: number;
  message?: string;
}

interface AdminLoginResponse {
  token: string;
}

interface GenerateTokenResponse {
  token_string: string;
}

// Mock data
let mockActiveSessions = 0;
const mockTokens = new Set<string>();
const mockAdminCredentials = {
  username: 'admin',
  password: 'admin123'
};

export const mockApi = {
  // Public status endpoint
  getStatus: async (): Promise<StatusResponse> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      status: 'AKTIF',
      active_sessions: mockActiveSessions,
      max_sessions: 3
    };
  },

  // Admin login
  adminLogin: async (username: string, password: string): Promise<AdminLoginResponse> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (username === mockAdminCredentials.username && password === mockAdminCredentials.password) {
      return { token: 'mock-jwt-token-' + Date.now() };
    }
    throw new Error('Username atau password salah');
  },

  // Generate token (admin only)
  generateToken: async (adminToken: string): Promise<GenerateTokenResponse> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    if (!adminToken.startsWith('mock-jwt-token-')) {
      throw new Error('Unauthorized');
    }
    
    const newToken = `LAB-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    mockTokens.add(newToken);
    return { token_string: newToken };
  },

  // Validate token (internal use)
  validateToken: async (token: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockTokens.has(token);
  },

  // Mark token as used
  useToken: (token: string) => {
    mockTokens.delete(token);
  },

  // Session management
  incrementSessions: () => {
    mockActiveSessions++;
  },

  decrementSessions: () => {
    if (mockActiveSessions > 0) {
      mockActiveSessions--;
    }
  }
};
