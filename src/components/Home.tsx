import React from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, CardMedia, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import PetsIcon from '@mui/icons-material/Pets';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      title: 'Cadastre Seu Pet',
      description: 'Registre seu pet perdido ou encontrado com fotos e detalhes importantes.',
      icon: <PetsIcon sx={{ fontSize: 40 }} />,
      action: 'Cadastrar Pet',
      to: '/pets',
    },
    {
      title: 'Busque por Localização',
      description: 'Encontre pets próximos a você usando nossa busca por localização.',
      icon: <LocationOnIcon sx={{ fontSize: 40 }} />,
      action: 'Buscar',
      to: '/search-by-location',
    },
    {
      title: 'Explore Pets Públicos',
      description: 'Veja todos os pets cadastrados e ajude a encontrá-los.',
      icon: <SearchIcon sx={{ fontSize: 40 }} />,
      action: 'Explorar',
      to: '/pets/public-pets',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          mb: 6,
          borderRadius: 2,
          backgroundImage: 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                Encontre Seu Pet Perdido
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                Conectamos pessoas que perderam seus pets com quem os encontrou.
                Junte-se à nossa comunidade e ajude a reunir famílias.
              </Typography>
              <Button
                component={RouterLink}
                to="/pets"
                variant="contained"
                size="large"
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'grey.100',
                  },
                }}
              >
                Cadastrar Pet
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  width: '100%',
                  maxWidth: 500,
                  height: 300,
                  borderRadius: 4,
                  boxShadow: 3,
                  display: 'block',
                  mx: 'auto',
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'url("https://images.unsplash.com/photo-1450778869180-41d0601e046e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80") center/cover',
                    opacity: 0.9,
                    transition: 'opacity 0.3s ease-in-out',
                  },
                  '&:hover::before': {
                    opacity: 1,
                  },
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg">
        <Typography variant="h3" component="h2" gutterBottom align="center" sx={{ mb: 6 }}>
          Como Funciona
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography gutterBottom variant="h5" component="h3">
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Button
                    component={RouterLink}
                    to={feature.to}
                    variant="contained"
                    fullWidth
                  >
                    {feature.action}
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Stats Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8, mt: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h2" color="primary" gutterBottom>
                  1000+
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Pets Cadastrados
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h2" color="primary" gutterBottom>
                  500+
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Pets Encontrados
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h2" color="primary" gutterBottom>
                  100+
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Cidades Atendidas
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;