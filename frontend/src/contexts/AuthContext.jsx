import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

const STORAGE_KEY_USER = 'resume_ai_user';
const STORAGE_KEY_TOKEN = 'resume_ai_token';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY_USER);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY_TOKEN) || null);
  const [isLoading, setIsLoading] = useState(Boolean(localStorage.getItem(STORAGE_KEY_TOKEN)));

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem(STORAGE_KEY_TOKEN, token);
    } else {
      localStorage.removeItem(STORAGE_KEY_TOKEN);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    const loadUser = async () => {
      try {
        const profile = await authService.me();
        setUser(profile);
      } catch {
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const register = async (name, email, password, role = 'recruiter') => {
    setIsLoading(true);
    try {
      const payload = { full_name: name, email, password, role };
      await authService.register(payload);
      toast.success('Account created. Please verify your email before signing in.');
      return { email };
    } catch (error) {
      toast.error(error.message || 'Registration failed.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmailCode = async (email, code) => {
    setIsLoading(true);
    try {
      const response = await authService.verifyEmail({ email, code });
      // The API returns an AuthToken on successful verification
      if (response?.access_token) {
        localStorage.setItem(STORAGE_KEY_TOKEN, response.access_token);
        setToken(response.access_token);
        // Fetch and set the user profile
        const profile = await authService.me();
        setUser(profile);
      }
      toast.success('Email verified. You can sign in now.');
      return true;
    } catch (error) {
      toast.error(error.message || 'Verification failed.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async (email) => {
    try {
      await authService.resendCode({ email });
      toast.success('A new verification code was sent.');
    } catch (error) {
      toast.error(error.message || 'Unable to resend code.');
      throw error;
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      localStorage.setItem(STORAGE_KEY_TOKEN, response.access_token);
      setToken(response.access_token);
      const profile = await authService.me();
      setUser(profile);
      toast.success(`Welcome back, ${profile.full_name || email}!`);
      return profile;
    } catch (error) {
      toast.error(error.message || 'Unable to sign in.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore logout errors and clear local state anyway.
    } finally {
      setUser(null);
      setToken(null);
      toast.success('Signed out.');
    }
  };

  const switchRole = (newRole) => {
    if (user) {
      setUser({ ...user, role: newRole });
      toast.success(`Role switched to ${newRole === 'recruiter' ? 'Recruiter' : 'Candidate'}.`);
    }
  };

  const updateProfile = (profileData) => {
    if (user) {
      setUser({ ...user, ...profileData });
      toast.success('Profile updated.');
    }
  };

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isRecruiter: user?.role === 'recruiter',
    isCandidate: user?.role === 'candidate',
    isLoading,
    login,
    register,
    verifyEmailCode,
    resendCode,
    logout,
    switchRole,
    updateProfile,
  }), [isLoading, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
