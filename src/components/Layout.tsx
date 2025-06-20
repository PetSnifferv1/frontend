import React from 'react';
import { Box, Container, AppBar, Toolbar, Typography, Button, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import PetsIcon from '@mui/icons-material/Pets';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky" elevation={1} sx={{ backgroundColor: 'white', color: 'primary.main' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <IconButton
              component={RouterLink}
              to="/"
              sx={{ mr: 2, color: 'primary.main' }}
            >
              <PetsIcon />
            </IconButton>
            <Typography
              variant="h6"
              component={RouterLink}
              to="/"
              sx={{
                flexGrow: 1,
                textDecoration: 'none',
                color: 'primary.main',
                fontWeight: 700,
                letterSpacing: '.1rem',
              }}
            >
              PetSniffer
            </Typography>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                component={RouterLink}
                to="/pets/public-pets"
                color="inherit"
                sx={{ 
                  '&:hover': { 
                    backgroundColor: 'rgba(25, 118, 210, 0.04)',
                    color: 'primary.main'
                  }
                }}
              >
                Pets Públicos
              </Button>
              <Button
                component={RouterLink}
                to="/search-by-location"
                color="inherit"
                sx={{ 
                  '&:hover': { 
                    backgroundColor: 'rgba(25, 118, 210, 0.04)',
                    color: 'primary.main'
                  }
                }}
              >
                Buscar por Localização
              </Button>
              {isAuthenticated ? (
                <>
                  <Button
                    component={RouterLink}
                    to="/pets"
                    color="inherit"
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: 'rgba(25, 118, 210, 0.04)',
                        color: 'primary.main'
                      }
                    }}
                  >
                    Meus Pets
                  </Button>
                  <Button
                    onClick={handleLogout}
                    color="inherit"
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: 'rgba(25, 118, 210, 0.04)',
                        color: 'primary.main'
                      }
                    }}
                  >
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    component={RouterLink}
                    to="/login"
                    color="inherit"
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: 'rgba(25, 118, 210, 0.04)',
                        color: 'primary.main'
                      }
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="contained"
                    sx={{ 
                      ml: 1,
                      '&:hover': { 
                        backgroundColor: 'primary.dark'
                      }
                    }}
                  >
                    Cadastrar
                  </Button>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Container maxWidth="lg">
          {children}
        </Container>
      </Box>

      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} PetSniffer. Todos os direitos reservados.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout; 