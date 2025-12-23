export interface AuthData {
  token: string;
  user_id: number;
  email: string;
  role: 'admin' | 'counselor' | 'user'; // Đã xác định ở Backend
}

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'counselor' | 'user';
}

export interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (data: AuthData) => void;
  logout: () => void;
  fetchProfile: () => Promise<void>;
}