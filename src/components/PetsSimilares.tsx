import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, CircularProgress, Dialog, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import './Pets.css';
import dayjs from 'dayjs';

interface Pet {
  id: string;
  nome: string;
  tipo: string;
  raca: string;
  cor: string;
  status: string;
  datahora: string;
  foto: string;
  location: string;
  latitude: number;
  longitude: number;
  pais?: string;
  estado?: string;
  cidade?: string;
  bairro?: string;
  rua?: string;
  photos: string[];
}

const PetsSimilares: React.FC = () => {
  const { petId } = useParams<{ petId: string }>();
  const maxDistance = 15;
  const limite = 100;
  const [similares, setSimilares] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFoto, setSelectedFoto] = useState<string | null>(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchSimilares = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/pets/similares/${petId}?maxDistance=${maxDistance}&limite=${limite}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Erro ao buscar pets similares.');
        }
        const data = await response.json();
        setSimilares(data);
      } catch (err: any) {
        setError(err.message || 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };
    if (petId) fetchSimilares();
  }, [petId]);

  const getStatusLabel = (status: string) => {
    return status === 'LOST' ? 'Perdido' : 'Achado';
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 4, pb: 6 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        Pets Similares
      </Typography>
      <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 3 }}>
        Voltar
      </Button>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : similares.length === 0 ? (
        <Typography>Nenhum pet similar encontrado.</Typography>
      ) : (
        <Box className="pets-grid">
          {similares.map((pet) => (
            <Box key={pet.id} className="card">
              <Box className="image-container" sx={{
                height: '300px',
                overflow: 'hidden',
                borderRadius: '8px 8px 0 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f5f5',
                padding: '8px'
              }}>
                <Box
                  component="img"
                  src={pet.photos?.[0] || pet.foto || 'https://via.placeholder.com/400x225'}
                  alt={pet.nome}
                  onClick={() => setSelectedFoto(pet.photos?.[0] || pet.foto || null)}
                  sx={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    transition: 'transform 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'scale(1.05)'
                    }
                  }}
                />
              </Box>
              <Box className="pet-info">
                <Typography className="pet-name">
                  {pet.nome}
                </Typography>
                <Typography className="pet-details">
                  <span>{pet.tipo}</span>
                  <span>•</span>
                  <span>{pet.raca}</span>
                </Typography>
                <Typography className="pet-details">
                  <span>{pet.cor}</span>
                  <span>•</span>
                  <span className={`status-badge status-${pet.status.toLowerCase()}`}>{getStatusLabel(pet.status)}</span>
                </Typography>
                <Typography className="pet-details">
                  <span>📅</span>
                  <span>{dayjs(pet.datahora).format('DD/MM/YYYY')}</span>
                </Typography>
                {(pet.pais || pet.estado || pet.cidade || pet.bairro) && (
                  <Typography className="pet-details">
                    <span>📍</span>
                    <span>
                      {[
                        pet.bairro,
                        pet.cidade,
                        pet.estado,
                        pet.pais
                      ].filter(Boolean).join(' - ')}
                    </span>
                  </Typography>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      )}
      {/* Image Preview Dialog */}
      <Dialog
        open={!!selectedFoto}
        onClose={() => setSelectedFoto(null)}
        maxWidth="md"
        fullWidth
        TransitionProps={{
          timeout: 500
        }}
        PaperProps={{
          sx: {
            opacity: selectedFoto ? 1 : 0,
            transition: 'opacity 0.5s ease',
            backgroundColor: 'transparent',
            boxShadow: 'none'
          }
        }}
      >
        <Box sx={{
          position: 'relative',
          p: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 2,
          transition: 'all 0.3s ease'
        }}>
          <IconButton
            onClick={() => setSelectedFoto(null)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              zIndex: 1,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
          <Box
            component="img"
            src={selectedFoto || ''}
            alt="Full size"
            sx={{
              width: '100%',
              height: 'auto',
              maxHeight: '80vh',
              objectFit: 'contain',
              borderRadius: 'var(--radius-md)',
              opacity: 1,
              transition: 'opacity 0.5s ease'
            }}
          />
        </Box>
      </Dialog>
    </Container>
  );
};

export default PetsSimilares; 