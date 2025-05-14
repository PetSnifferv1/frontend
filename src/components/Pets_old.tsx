import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Map from './Map';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box, MenuItem, Card, CardContent, CardMedia, Grid, IconButton, CircularProgress } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DateTimePicker } from '@mui/x-date-pickers';
import '@mui/lab';
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import './Pets.css';

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
  ownerid: string;
  location: string;
}

const Pets: React.FC = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [nome, setNome] = useState('');
  const [status, setStatus] = useState('LOST'); // Default status
  const [foto, setFoto] = useState('');
  const [cor, setCor] = useState('');
  const [datahora, setDatahora] = useState<Dayjs | null>(null); 
  const [loading, setLoading] = useState(false);

  const formattedDataHora = dayjs();
  const formData = new FormData();
  const [imagem, setImagem] = useState<File | null>(null);
    
  const [ownerid, setOwnerid] = useState('');
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [editingPetId, setEditingPetId] = useState<string | null>(null);
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  
  const [tipo, setTipo] = useState<string>('Cachorro');
  const [raca, setRaca] = useState('');
  const [customRaca, setCustomRaca] = useState('');
  const [isCustomRaca, setIsCustomRaca] = useState(false);
  const [racas, setRacas] = useState<string[]>(CACHORRO_RACAS);
  const [location, setLocation] = useState('');
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [selectedFoto, setSelectedFoto] = useState<string | null>(null);

  useEffect(() => {
    atualizaListaPets();
  }, [token, userId]);

  const atualizaListaPets = () => {
    fetchPets();
  };

  const fetchPets = async () => {
    setLoading(true);
    const response = await fetch(`http://localhost:8080/pets/my-pets?ownerid=${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      setPets(data);
    } else {
      alert('Failed to fetch pets');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPets();
  }, [token, userId]);

  useEffect(() => {
    if (tipo === 'Cachorro') {
      setRacas(CACHORRO_RACAS);
    } else if (tipo === 'Gato') {
      setRacas(GATO_RACAS);
    }
  }, [tipo]);

  useEffect(() => {
    // Inicializa a datahora com a data atual
    setDatahora(dayjs(new Date()));
  }, []);

  const handleImagemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        setFotoPreview(URL.createObjectURL(file)); // Define a pré-visualização da imagem
        setImagem(file); // Armazene o arquivo no estado
        reader.onloadend = () => {
          setFotoPreview(reader.result as string); // Define a pré-visualização da imagem
          setFoto(reader.result as string); // Define a foto para o corpo da requisição
      };
    } 
};

useEffect(() => {
  if (imagem) {
      console.log('Imagem carregada:', imagem);
  }
}, [imagem]);

  const handleAddPet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagem)  {
      alert('Please select a photo');
      return;
    }
    formData.append('file',   imagem ? imagem : '');
    formData.append('nome',     nome);
    formData.append('tipo',     tipo);
    formData.append('raca',     raca);
    formData.append('cor',      cor);
    formData.append('status',   status);
    formData.append('datahora', datahora ? dayjs(datahora).format('YYYY-MM-DDTHH:mm:ss') : '');
    formData.append('ownerid',  userId? userId : '');
    formData.append('location', location);
   
   // const response = await axios.post('http://localhost:8080/pets/create-pets', formData, {
      const response = await axios.post('http://localhost:8080/fileup', formData, {
      
            headers: {
            'Authorization': `Bearer ${token}`,
            }
          });

   if (response.status >= 200 && response.status < 300) {
    console.log('Requisição bem-sucedida!', response.data);
      try {
        const       newPet = response.data;
        setPets([...pets, newPet]); // Atualiza a lista de pets com o novo pet
        setNome('');
        setRaca('');
        setStatus('LOST'); 
        setFoto('');
        setCustomRaca('');
        setTipo('');
        setIsCustomRaca(false);
        setOwnerid('');
        setLocation('');
        setFotoPreview(null);
        setDatahora(dayjs(new Date()));
        atualizaListaPets();
        
      } catch (error) {
        console.error('Error parsing JSON:', error);
        alert('Failed to parse response');
      }
    } else {
      alert('Failed to add pet');
    }
  };

  const handleEditPet = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingPetId) {
      alert('No pet selected for editing');
      return;
    }
    try {
      const petData = { nome, tipo, raca: isCustomRaca ? customRaca : raca, cor, status, datahora: formattedDataHora, foto, ownerid: userId, location };
  
      console.log('Edit body:', petData); 
      const response = await fetch(`http://localhost:8080/pets/alter-pets/${editingPetId}`, {
        method: 'PUT',
        headers: {
          'Content-type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(petData),
      });
      
      if (response.ok) {
        const updatedPet = await response.json();
        setPets(pets.map(pet => (pet.id === editingPetId ? updatedPet : pet)));
        setNome('');
        setRaca('');
        setCustomRaca('');
        setStatus('FOUND');
        setFoto('');
        setCor('');
        setDatahora(dayjs(new Date()));
        setFotoPreview(null);
        setOwnerid('');
        setEditingPetId(null); // Redefine editingPetId para null
        setIsCustomRaca(false);
        setLocation('');
        //fetchPets(); 
        atualizaListaPets();
    
      } else {
        alert('Failed to edit pet');
      }
    } catch (error) {
      console.error('Error editing pet:', error);
      alert('Failed to edit pet');
    }
  };

  const handleDeletePet = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this pet?')) {
      return;
    }

    const response = await fetch(`http://localhost:8080/pets/delete-pets/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      setPets(pets.filter(pet => pet.id !== id));
    } else {
      alert('Failed to delete pet');
    }
  };

  const startEditing = (pet: Pet) => {
    setEditingPetId(pet.id);
    setNome(pet.nome);
    setTipo(pet.tipo);
    setRaca(pet.raca);
    setStatus(pet.status);
    setFoto(pet.foto);
    setCor(pet.cor);
    setDatahora(dayjs(new Date()));
    setOwnerid(pet.ownerid);
    setDatahora(pet.datahora ? (dayjs(new Date())) : null);
    setFotoPreview(pet.foto);
    setIsCustomRaca(!CACHORRO_RACAS.includes(pet.raca) && !GATO_RACAS.includes(pet.raca));
    setCustomRaca(!CACHORRO_RACAS.includes(pet.raca) && !GATO_RACAS.includes(pet.raca) ? pet.raca : '');
    setLocation(pet.location || ''); // Set the location from the pet data
  
  };

  const getStatusLabel = (status: string) => {
    return status === 'LOST' ? 'Lost' : 'Found';
  };

  const handleCloseModal = () => {
    setSelectedFoto(null);
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Pets
      </Typography>
      <Box component="form" onSubmit={editingPetId ? handleEditPet : handleAddPet} sx={{ mb: 4 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          label="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          select
          label="Tipo"
          value={tipo}
          onChange={(e) => {
            setTipo(e.target.value);
            console.log('Animal tipo selected:', e.target.value); // Adicionando log para verificar o valor de tipo
          }}
        >
          {ANIMAL_TYPES.map((tipo) => (
            <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
          ))}
        </TextField>
        <TextField
          margin="normal"
          required
          fullWidth
          select
          label="Raça"
          value={raca}
          onChange={(e) => {
            setRaca(e.target.value);
            setIsCustomRaca(e.target.value === 'Outra');
          }}
        >
          <MenuItem value="">Selecione a raça</MenuItem>
          {racas.map((raca) => (
            <MenuItem key={raca} value={raca}>{raca}</MenuItem>
          ))}
          <MenuItem value="Outra">Outra</MenuItem>
        </TextField>
        {isCustomRaca && (
          <TextField
            margin="normal"
            required
            fullWidth
            label="Outra raça"
            value={customRaca}
            onChange={(e) => setCustomRaca(e.target.value)}
          />
        )}
        <TextField
          margin="normal"
          required
          fullWidth
          label="Cor"
          value={cor}
          onChange={(e) => setCor(e.target.value)}
        />
     <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateTimePicker
        label="Data e Hora"
        //value={datahora ? dayjs(datahora) : null} // Converte Date para Dayjs
        value={datahora && dayjs(datahora).isValid() ? dayjs(datahora) : null}

        onChange={(newValue) => setDatahora(newValue ? (dayjs(new Date())) : null)} // Converte Dayjs para Date
        slots={{
          textField: (props) => (
        <TextField {...props} margin="normal" required fullWidth />
        ),
        }}
        // Formato desejado
        views={['year', 'month', 'day', 'hours', 'minutes']} // Controla quais partes da data/hora são exibidas
        format="DD/MM/YYYY HH:mm" // Formato de 24 horas

        />
    </LocalizationProvider>
        <TextField
          margin="normal"
          required
          fullWidth
          select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <MenuItem value="LOST">LOST</MenuItem>
          <MenuItem value="FOUND">FOUND</MenuItem>
        </TextField>
        <Button 
          variant="contained"
          component="label"
          sx={{ mt: 2 }}
        >
          Adicione a Foto do PET
          <input
            id="imagem"
            name='imagem'
            type="file"
            hidden
            onChange={handleImagemChange}
            required={!editingPetId} // Foto é obrigatória apenas ao adicionar um novo pet
            className="input-large-font" // Aplicando a classe CSS
          />
        </Button>
        {fotoPreview && (
          <Box sx={{ mt: 2 }}>
            <img src={fotoPreview} alt="Preview" style={{ width: '150px', height: '150px' }} />
          </Box>
        )}
        <Button
          variant="contained"
          onClick={() => setIsMapOpen(true)}
          sx={{ mt: 2 }}
        >
          Selecionar Localização
        </Button>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          {editingPetId ? 'Edit Pet' : 'Add Pet'}
        </Button>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={4}>
          {pets.map((pet) => (
            <Grid item key={pet.id} xs={12} sm={6} md={4}>
              <Card>
                <CardMedia
                  component="img"
                  height="300"
                  image={pet.foto}
                  alt={pet.nome}
                  onClick={() => setSelectedFoto(pet.foto)}
                  sx={{
                    cursor: 'pointer',
                    objectFit: 'cover', // Ajusta a imagem ao frame
                    width: '100%', // Garante a largura total
                  }}
                  style={{ cursor: 'pointer' }}
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {pet.nome}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Raça: {pet.raca}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Status: {getStatusLabel(pet.status)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Data: {dayjs(pet.datahora).format('DD/MM/YYYY HH:mm')}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <IconButton onClick={() => startEditing(pet)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeletePet(pet.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      {selectedFoto && (
        <div className="modal" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={handleCloseModal}>&times;</span>
            <img src={selectedFoto} alt="Selected" className="foto-modal" />
          </div>
        </div>
      )}
    </Container>
  );
};

export default Pets;