import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (!token || !savedUser) {
        console.log('No token or user data found, cleaning up...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        // Validate token with backend
        const response = await fetch('${import.meta.env.VITE_API_URL}/auth/validate', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          console.log('Token validation failed, cleaning up...');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error validating authentication:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
      }
      
      setLoading(false);
    };

    validateAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Clear any existing auth data first
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);

      console.log('Attempting login with:', { email, password });
      
      const requestBody = {
        login: email,
        password: password
      };
      
      console.log('Request body:', requestBody);
      
      const response = await fetch('${import.meta.env.VITE_API_URL}/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Login response status:', response.status);
      
      const responseText = await response.text();
      console.log('Raw response text:', responseText);

      if (!response.ok) {
        let errorMessage = 'Authentication failed';
        try {
          const errorJson = JSON.parse(responseText);
          errorMessage = errorJson.message || errorJson.error || errorJson.details || responseText;
        } catch (e) {
          if (response.status === 401) {
            errorMessage = 'Credenciais inválidas';
          } else if (response.status === 403) {
            errorMessage = 'Acesso negado';
          } else if (responseText) {
            errorMessage = responseText;
          }
        }
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        throw new Error('Formato de resposta inválido do servidor');
      }

      if (!data.token) {
        throw new Error('Token não recebido do servidor');
      }

      const userData = {
        id: data.userId,
        name: email,
        email: email,
        role: data.userRole || 'USER',
      };

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      console.log('Attempting registration with:', { name, email, password });
      
      const response = await fetch('${import.meta.env.VITE_API_URL}/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          login: email,  // O login é o mesmo que o email
          email: email,
          password: password,
          role: 'USER'  // Role padrão para novos usuários
        }),
      });

      console.log('Register response status:', response.status);
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Registration failed with status:', response.status, 'Error:', errorData);
        throw new Error(`Registration failed: ${errorData}`);
      }

      await login(email, password);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 