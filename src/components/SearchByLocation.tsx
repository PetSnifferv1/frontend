import React, { useState } from "react";
import { TextField, Button, Container, Typography, Box, CircularProgress, Dialog, IconButton } from "@mui/material";
import MapComponent from "./MapComponent";
import dayjs from "dayjs";
import DeleteIcon from '@mui/icons-material/Delete';
import './Pets.css';
import CloseIcon from '@mui/icons-material/Close';

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
}

const SearchByLocation: React.FC = () => {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedFoto, setSelectedFoto] = useState<string | null>(null);

  const getStatusLabel = (status: string) => {
    return status === 'LOST' ? 'Perdido' : 'Achado';
  };

  const getLocationDescription = (location: string) => {
    // Aqui você pode implementar uma lógica para converter coordenadas em descrição
    // Por exemplo, usando uma API de geocoding reverso
    // Por enquanto, vamos retornar uma descrição genérica
    return `Próximo a ${location}`;
  };

  const handleLocationSelect = (location: { lat: number; lng: number; address?: string; pais?: string; estado?: string; cidade?: string; bairro?: string; rua?: string }) => {
    setLatitude(location.lat.toFixed(6));
    setLongitude(location.lng.toFixed(6));
    setIsMapOpen(false);
  };

  const radius = 3;

  const handleSearch = async () => {
    if (!latitude || !longitude) {
      alert("Por favor, selecione uma localização.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8080/pets/search-by-location?lat=${latitude}&lng=${longitude}&radius=${radius}`
      );
      if (response.ok) {
        const data = await response.json();
        setPets(data);
      } else {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        alert("Erro ao buscar pets. Por favor, tente novamente.");
      }
    } catch (error) {
      console.error("Erro na busca:", error);
      alert("Falha na requisição. Por favor, tente novamente.");
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 4, pb: 6 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        Buscar Pets por Localização
      </Typography>
      
      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          fullWidth
          label="Latitude"
          value={latitude}
          disabled
          variant="outlined"
          sx={{ maxWidth: 200 }}
        />
        <TextField
          fullWidth
          label="Longitude"
          value={longitude}
          disabled
          variant="outlined"
          sx={{ maxWidth: 200 }}
        />
        <Button
          variant="contained"
          onClick={() => setIsMapOpen(true)}
          sx={{ minWidth: 120 }}
        >
          Selecionar no Mapa
        </Button>
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={loading}
          sx={{ minWidth: 120 }}
        >
          {loading ? <CircularProgress size={24} /> : "Buscar"}
        </Button>
      </Box>

      {isMapOpen && (
        <Dialog
          open={isMapOpen}
          onClose={() => setIsMapOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Selecione a Localização no Mapa
            </Typography>
            <MapComponent onLocationSelect={handleLocationSelect} />
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={() => setIsMapOpen(false)}>
                Fechar Mapa
              </Button>
            </Box>
          </Box>
        </Dialog>
      )}

      <Box className="pets-grid" sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: 3, 
        mt: 4 
      }}>
        {pets.map((pet) => (
          <Box key={pet.id} className="card" sx={{
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-lg)',
            boxShadow: 'var(--shadow-md)',
            transition: 'all 0.3s ease',
            overflow: 'hidden',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 'var(--shadow-lg)',
              borderColor: 'var(--primary-color)'
            }
          }}>
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
                src={pet.foto || 'https://via.placeholder.com/400x225'}
                alt={pet.nome}
                onClick={() => setSelectedFoto(pet.foto || null)}
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
            <Box className="pet-info" sx={{
              padding: 'var(--spacing-md) 0',
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-sm)'
            }}>
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
                <span className={`status-badge status-${pet.status.toLowerCase()}`}>
                  {getStatusLabel(pet.status)}
                </span>
              </Typography>
              <Typography className="pet-details">
                <span>📅</span>
                <span>{dayjs(pet.datahora).format("DD/MM/YYYY")}</span>
              </Typography>
              {pet.location && (
                <Typography className="pet-details">
                  <span>📍</span>
                  <span>{getLocationDescription(pet.location)}</span>
                </Typography>
              )}
            </Box>
          </Box>
        ))}
      </Box>

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

export default SearchByLocation;
