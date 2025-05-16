import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
//import Map from './Map';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box, MenuItem, Card, CardContent, CardMedia, Grid, IconButton, CircularProgress, AppBar, Toolbar, Dialog, DialogTitle, DialogContent, DialogActions, Chip, DialogContentText } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DateTimePicker } from '@mui/x-date-pickers';
import '@mui/lab';
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import PetsIcon from '@mui/icons-material/Pets';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

import './Pets.css';
import MapComponent from './MapComponent';

dayjs.extend(customParseFormat); // Adicione o plugin de formatação, se necessário


const ANIMAL_TYPES = ['Cachorro', 'Gato'];
const CACHORRO_RACAS = [
  'Labrador', 'Poodle', 'Bulldog', 'Beagle', 'Dachshund', 'Boxer', 'Chihuahua', 'Golden Retriever', 'Rottweiler', 'Shih Tzu'
  // Adicione outras raças de cachorros aqui
];
const GATO_RACAS = [
  'Persa', 'Siames', 'Maine Coon', 'Bengal', 'Sphynx', 'Ragdoll', 'British Shorthair', 'Abyssinian', 'Birman', 'Russian Blue'
  // Adicione outras raças de gatos aqui
];

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
  userId: string;
}

interface Location {
  lat: number;
  lng: number;
  pais?: string;
  estado?: string;
  cidade?: string;
  bairro?: string;
  rua?: string;
}

const Pets: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [selectedFoto, setSelectedFoto] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    breed: '',
    status: '',
    description: '',
    location: '',
    latitude: '',
    longitude: '',
    photos: [] as string[],
    cor: '',
  });

  
  const [imagem, setImagem] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [editingPetId, setEditingPetId] = useState<string | null>(null);
  const [tipo, setTipo] = useState<string>('Cachorro');
  const [raca, setRaca] = useState('');
  const [customRaca, setCustomRaca] = useState('');
  const [isCustomRaca, setIsCustomRaca] = useState(false);
  const [racas, setRacas] = useState<string[]>(CACHORRO_RACAS);
  const [location, setLocation] = useState<Location | null>(null);
  const [locationString, setLocationString] = useState<string>('');
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [breed, setBreed] = useState('');
  const [color, setColor] = useState('');
  const [status, setStatus] = useState('');
  const [datahora, setDatahora] = useState<Dayjs | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  
  const handleClose = () => {
    setOpenAddDialog(false);
    setFormData({
      name: '',
      type: '',
      breed: '',
      status: '',
      description: '',
      location: '',
      latitude: '',
      longitude: '',
      photos: [],
      cor: '',
    });
    setImagem(null);
    setSelectedImage(null);
    setFotoPreview(null);
    setLocation(null);
    setLocationString('');
    setDatahora(null);
  };

  const handleLocationSelect = (location: Location) => {
    setLocation(location);
    setLocationString(`${location.lat}, ${location.lng}`);
    setIsMapOpen(false);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      console.log('Token:', token);
      console.log('User:', user);
      console.log('isAuthenticated:', isAuthenticated);
      console.log('Saved user:', savedUser);
      
      if (!token || !isAuthenticated || !user) {
        console.log('Usuário não autenticado, redirecionando para login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { state: { from: '/pets' } });
        return;
      }
      
      try {
        const userData = savedUser ? JSON.parse(savedUser) : null;
        if (!userData || !userData.id) {
          console.log('Dados do usuário inválidos, redirecionando para login');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login', { state: { from: '/pets' } });
          return;
        }
        
        console.log('Usuário autenticado, buscando pets');
        await fetchPets();
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { state: { from: '/pets' } });
      }
    };

    checkAuth();
  }, [user, isAuthenticated, navigate]);

  const fetchPets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userId = user?.id;
      
      console.log('Fetching pets with:', {
        userId,
        hasToken: !!token,
        token: token ? 'present' : 'missing'
      });

      if (!userId) {
        console.error('No user ID found');
        return;
      }

      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await fetch(`http://localhost:8080/pets/my-pets?ownerid=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        throw new Error(`Failed to fetch pets: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      console.log('Raw data from backend:', data);

      // Map the backend data to frontend format
      const mappedPets = data.map((pet: any) => ({
        id: pet.id,
        nome: pet.nome,
        tipo: pet.tipo,
        raca: pet.raca,
        status: pet.status,
        description: pet.descricao,
        location: pet.location,
        latitude: pet.latitude,
        longitude: pet.longitude,
        photos: pet.foto ? [pet.foto] : [],
        userId: pet.ownerid,
        datahora: pet.datahora,
        pais: pet.pais,
        estado: pet.estado,
        cidade: pet.cidade,
        bairro: pet.bairro,
        cor: pet.cor
      }));

      console.log('Mapped pets:', mappedPets);
      setPets(mappedPets);
    } catch (error) {
      console.error('Error fetching pets:', error);
      alert('Failed to fetch pets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tipo === 'Cachorro') {
      setRacas(CACHORRO_RACAS);
    } else if (tipo === 'Gato') {
      setRacas(GATO_RACAS);
    }
  }, [tipo]);

  const handleImagemChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB em bytes
      if (file.size > MAX_SIZE) {
        alert('A imagem deve ter no máximo 10MB. Por favor, escolha uma imagem menor ou comprima a imagem atual.');
        event.target.value = '';
        return;
      }

      // Verificar se é realmente uma imagem
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem (jpg, png, etc).');
        event.target.value = '';
        return;
      }

      setImagem(file);
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPet = async () => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    console.log('Token ao adicionar pet:', token);
    console.log('User ao adicionar pet:', user);
    console.log('isAuthenticated ao adicionar pet:', isAuthenticated);
    console.log('Saved user ao adicionar pet:', savedUser);
    
    if (!token || !isAuthenticated || !user) {
      console.log('Usuário não autenticado ao tentar adicionar pet');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      alert('Você precisa estar logado para cadastrar um pet');
      navigate('/login', { state: { from: '/pets' } });
      return;
    }
    
    try {
      const userData = savedUser ? JSON.parse(savedUser) : null;
      if (!userData || !userData.id) {
        console.log('Dados do usuário inválidos ao tentar adicionar pet');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        alert('Sessão inválida. Por favor, faça login novamente.');
        navigate('/login', { state: { from: '/pets' } });
        return;
      }

      if (!imagem) {
        alert('Por favor, selecione uma imagem');
        return;
      }

      if (!location) {
        alert('Por favor, selecione uma localização no mapa');
        return;
      }

      if (!formData.name || !formData.type || !formData.breed || !formData.status || !formData.cor || !datahora) {
        alert('Por favor, preencha todos os campos obrigatórios');
        return;
      }

      const userId = user?.id;

      if (!userId) {
        console.error('No user ID found');
        alert('Erro ao identificar o usuário. Por favor, faça login novamente.');
        navigate('/login');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('file', imagem);
      formDataToSend.append('nome', formData.name);
      formDataToSend.append('tipo', formData.type);
      formDataToSend.append('raca', formData.breed);
      formDataToSend.append('cor', formData.cor);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('datahora', datahora.format('YYYY-MM-DDTHH:mm:ss'));
      formDataToSend.append('ownerid', userId);
      formDataToSend.append('location', `${location.lat},${location.lng}`);
      formDataToSend.append('latitude', location.lat.toString());
      formDataToSend.append('longitude', location.lng.toString());
      formDataToSend.append('pais', location.pais || '');
      formDataToSend.append('estado', location.estado || '');
      formDataToSend.append('cidade', location.cidade || '');
      formDataToSend.append('bairro', location.bairro || '');
      formDataToSend.append('rua', location.rua || '');

      // Log para debug
      console.log('Dados de localização sendo enviados:', {
        lat: location.lat,
        lng: location.lng,
        pais: location.pais,
        estado: location.estado,
        cidade: location.cidade,
        bairro: location.bairro,
        rua: location.rua
      });

      const response = await axios.post('http://localhost:8080/fileup', formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status >= 200 && response.status < 300) {
        alert('Pet cadastrado com sucesso!');
        handleClose();
        fetchPets();
      }
    } catch (error) {
      console.error('Erro ao cadastrar pet:', error);
      alert('Erro ao cadastrar pet. Por favor, tente novamente.');
    }
  };

  const handleDeletePet = async () => {
    if (!selectedPet) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/pets/delete-pets/${selectedPet.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('Pet excluído com sucesso!');
        setOpenDeleteDialog(false);
        setSelectedPet(null);
        fetchPets();
      } else {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        alert('Erro ao excluir pet. Por favor, tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao excluir pet:', error);
      alert('Erro ao excluir pet. Por favor, tente novamente.');
    }
  };

  const handleEditPet = (pet: Pet) => {
    setEditingPetId(pet.id);
    setFormData({
      name: pet.nome,
      type: pet.tipo,
      breed: pet.raca,
      status: pet.status,
      description: '',
      location: pet.location,
      latitude: pet.latitude?.toString() ?? '',
      longitude: pet.longitude?.toString() ?? '',
      photos: pet.foto ? [pet.foto] : [],
      cor: pet.cor,
    });
    setImagem(null);
    setSelectedImage(null);
    setFotoPreview(pet.foto);
    setLocation({
      lat: pet.latitude ?? 0,
      lng: pet.longitude ?? 0,
      pais: pet.pais,
      estado: pet.estado,
      cidade: pet.cidade,
      bairro: pet.bairro,
      rua: pet.rua
      
    });
    setLocationString(pet.location);
    setDatahora(dayjs(pet.datahora));
    setOpenAddDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'LOST':
        return 'error';
      case 'FOUND':
        return 'success';
      default:
        return 'default';
    }
  };

  // Update the form field handlers
  const handleTypeChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    const newType = e.target.value as string;
    setFormData({ ...formData, type: newType });
    setTipo(newType);
    setFormData(prev => ({ ...prev, breed: '' })); // Reset breed when type changes
  };

  const handleBreedChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    const newBreed = e.target.value as string;
    if (newBreed === 'Other') {
      setIsCustomRaca(true);
    } else {
      setIsCustomRaca(false);
      setRaca(newBreed);
      setFormData({ ...formData, breed: newBreed });
    }
  };

  const handleCustomBreedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBreed = e.target.value;
    setCustomRaca(newBreed);
    setFormData({ ...formData, breed: newBreed });
  };

  const handleOpenAddDialog = () => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    console.log('Token ao abrir diálogo:', token);
    console.log('User ao abrir diálogo:', user);
    console.log('isAuthenticated ao abrir diálogo:', isAuthenticated);
    console.log('Saved user ao abrir diálogo:', savedUser);
    
    if (!token || !isAuthenticated || !user) {
      console.log('Usuário não autenticado ao tentar abrir diálogo');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      alert('Você precisa estar logado para cadastrar um pet');
      navigate('/login', { state: { from: '/pets' } });
      return;
    }
    
    try {
      const userData = savedUser ? JSON.parse(savedUser) : null;
      if (!userData || !userData.id) {
        console.log('Dados do usuário inválidos ao tentar abrir diálogo');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        alert('Sessão inválida. Por favor, faça login novamente.');
        navigate('/login', { state: { from: '/pets' } });
        return;
      }
      
      console.log('Abrindo diálogo de cadastro');
      setOpenAddDialog(true);
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      alert('Erro na sessão. Por favor, faça login novamente.');
      navigate('/login', { state: { from: '/pets' } });
    }
  };

  return (
    <div className="fade-in">
      <Container maxWidth="lg" sx={{ pt: 4, pb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            My Pets
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
            className="button-hover"
            sx={{
              backgroundColor: 'var(--primary-color)',
              '&:hover': {
                backgroundColor: 'var(--primary-dark)'
              }
            }}
          >
            Cadastrar Pet
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <CircularProgress />
          </Box>
        ) : pets.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '200px',
            textAlign: 'center',
            p: 3
          }}>
            <PetsIcon sx={{ fontSize: 48, color: 'var(--text-secondary)', mb: 2 }} />
            <Typography variant="h6" sx={{ color: 'var(--text-secondary)', mb: 1 }}>
              No pets found
            </Typography>
            <Typography variant="body1" sx={{ color: 'var(--text-secondary)' }}>
              Add your first pet by clicking the button above
            </Typography>
          </Box>
        ) : (
          <Box className="pets-grid">
            {pets.map((pet) => (
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
                  <Chip
                    label={pet.status}
                    color={getStatusColor(pet.status)}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                  <Typography className="pet-details">
                    <span>📅</span>
                    <span>{dayjs(pet.datahora).format("DD/MM/YYYY")}</span>
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
                  <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                    <IconButton
                      onClick={() => handleEditPet(pet)}
                      className="button-hover"
                      sx={{
                        color: 'var(--primary-color)',
                        '&:hover': {
                          backgroundColor: 'rgba(99, 102, 241, 0.1)'
                        }
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => {
                        setSelectedPet(pet);
                        setOpenDeleteDialog(true);
                      }}
                      className="button-hover"
                      sx={{
                        color: 'var(--error-color)',
                        '&:hover': {
                          backgroundColor: 'rgba(239, 68, 68, 0.1)'
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Container>

      {/* Add/Edit Pet Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingPetId ? 'Edit Pet' : 'Add New Pet'}
          <IconButton
            onClick={() => setOpenAddDialog(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'var(--text-secondary)'
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Nome"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <TextField
              select
              fullWidth
              label="Tipo"
              value={formData.type}
              onChange={(e) => {
                setFormData({ ...formData, type: e.target.value });
                setTipo(e.target.value);
              }}
              required
            >
              {ANIMAL_TYPES.map((tipo) => (
                <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              label="Raça"
              value={formData.breed}
              onChange={(e) => {
                setFormData({ ...formData, breed: e.target.value });
                setIsCustomRaca(e.target.value === 'Outra');
              }}
              required
            >
              <MenuItem value="">Selecione a raça</MenuItem>
              {racas.map((raca) => (
                <MenuItem key={raca} value={raca}>{raca}</MenuItem>
              ))}
              <MenuItem value="Outra">Outra</MenuItem>
            </TextField>

            {isCustomRaca && (
              <TextField
                fullWidth
                label="Outra raça"
                value={customRaca}
                onChange={(e) => {
                  setCustomRaca(e.target.value);
                  setFormData({ ...formData, breed: e.target.value });
                }}
                required
              />
            )}

            <TextField
              fullWidth
              label="Cor"
              value={formData.cor}
              onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
              required
            />

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="Data e Hora"
                value={datahora && dayjs(datahora).isValid() ? dayjs(datahora) : null}
                onChange={(newValue) => setDatahora(newValue ? dayjs(newValue) : null)}
                slots={{
                  textField: (props) => (
                    <TextField {...props} margin="normal" required fullWidth />
                  ),
                }}
                views={['year', 'month', 'day', 'hours', 'minutes']}
                format="DD/MM/YYYY HH:mm"
              />
            </LocalizationProvider>

            <TextField
              select
              fullWidth
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
            >
              <MenuItem value="LOST">LOST</MenuItem>
              <MenuItem value="FOUND">FOUND</MenuItem>
            </TextField>

            <Box>
              <Button 
                variant="contained"
                component="label"
                fullWidth
                sx={{ mb: 2 }}
              >
                Adicione a Foto do PET
                <input
                  id="imagem"
                  name='imagem'
                  type="file"
                  hidden
                  onChange={handleImagemChange}
                  required={!editingPetId}
                  accept="image/*"
                />
              </Button>
              {fotoPreview && (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                  <img 
                    src={fotoPreview} 
                    alt="Preview" 
                    style={{ 
                      maxWidth: '100%',
                      maxHeight: '400px',
                      width: 'auto',
                      height: 'auto',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }} 
                  />
                </Box>
              )}
            </Box>

            <Button
              variant="contained"
              onClick={() => setIsMapOpen(true)}
              fullWidth
              sx={{ mt: 2 }}
            >
              Selecionar Localização
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAddPet}
            variant="contained"
            sx={{
              backgroundColor: 'var(--primary-color)',
              '&:hover': {
                backgroundColor: 'var(--primary-dark)'
              }
            }}
          >
            {editingPetId ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this pet? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleDeletePet}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Map Dialog */}
      <Dialog
        open={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Select Location
          <IconButton
            onClick={() => setIsMapOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'var(--text-secondary)'
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ height: '400px', mt: 2 }}>
            <MapComponent
              onLocationSelect={handleLocationSelect}
              initialLocation={location ? [location.lat, location.lng] : undefined}
            />
          </Box>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog
        open={!!selectedFoto}
        onClose={() => setSelectedFoto(null)}
        maxWidth="md"
        fullWidth
        TransitionProps={{
          timeout: 500 // Duração da transição em milissegundos
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
    </div>
  );
};

export default Pets;