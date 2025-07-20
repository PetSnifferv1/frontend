import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PetsIcon from '@mui/icons-material/Pets';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { isAuthenticated, logout, deleteAccount } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleBuscarSimilares = async (petId: string) => {
    try {
      // Redireciona para a página de similares, passando o id do pet
      navigate(`/pets/similares/${petId}`);
    } catch (error) {
      alert('Erro ao buscar animais similares.');
      console.error(error);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) {
      try {
        await deleteAccount();
        navigate('/login');
      } catch (err) {
        alert('Erro ao excluir conta.');
      }
    }
  };

  return (
    <AppBar position="fixed" sx={{ 
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      boxShadow: 'var(--shadow-sm)',
      borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
    }}>
      <Toolbar>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <PetsIcon sx={{ mr: 2, color: 'var(--primary-color)' }} />
          <Typography variant="h6" component="div" sx={{ 
            color: 'var(--text-primary)',
            fontWeight: 600
          }}>
            PetSniffer
          </Typography>
        </Link>

        <Box sx={{ flexGrow: 1, display: 'flex', gap: 2, ml: 4 }}>
          <Button 
            color="inherit" 
            component={Link} 
            to="/pets/public-pets"
            className="button-hover"
            sx={{ 
              color: 'var(--text-primary)',
              backgroundColor: location.pathname === '/pets/public-pets' ? 'rgba(0, 0, 0, 0.04)' : 'transparent'
            }}
          >
            Pets Públicos
          </Button>
          <Button 
            color="inherit" 
            component={Link} 
            to="/search-by-location"
            className="button-hover"
            sx={{ 
              color: 'var(--text-primary)',
              backgroundColor: location.pathname === '/search-by-location' ? 'rgba(0, 0, 0, 0.04)' : 'transparent'
            }}
          >
            Buscar por Localização
          </Button>
          {isAuthenticated && (
            <Button 
              color="inherit" 
              component={Link} 
              to="/pets"
              className="button-hover"
              sx={{ 
                color: 'var(--text-primary)',
                backgroundColor: location.pathname === '/pets' ? 'rgba(0, 0, 0, 0.04)' : 'transparent'
              }}
            >
              Meus Pets
            </Button>
          )}
        </Box>

        <Box>
          {isAuthenticated ? (
            <>
              <Button 
                color="inherit" 
                component={Link}
                to="/chat"
                className="button-hover"
                sx={{ color: 'var(--text-primary)', mr: 2 }}
              >
                Chat
              </Button>
              <Button 
                color="inherit" 
                component={Link} 
                to="/profile"
                className="button-hover"
                sx={{ color: 'var(--text-primary)', mr: 2 }}
              >
                Perfil
              </Button>
              <Button 
                color="inherit" 
                onClick={logout}
                className="button-hover"
                sx={{ color: 'var(--text-primary)' }}
              >
                Sair
              </Button>
            </>
          ) : (
            <Button 
              color="inherit" 
              component={Link} 
              to="/login"
              className="button-hover"
              sx={{ color: 'var(--text-primary)' }}
            >
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 