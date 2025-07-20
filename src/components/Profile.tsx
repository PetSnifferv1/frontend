import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import {
  Card, CardContent, Typography, Button, Box, TextField, Stack, Alert, Avatar, Divider, Fade
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ login: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (user) {
          setProfile(user);
        } else {
          const token = localStorage.getItem('token');
          const response = await axios.get('/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setProfile(response.data);
        }
      } catch (err) {
        setError('Erro ao buscar dados do perfil.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir sua conta? Esta ação é irreversível.')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete('/auth/delete', {
        headers: { Authorization: `Bearer ${token}` },
      });
      logout();
    } catch (err) {
      setError('Erro ao excluir conta.');
    }
  };

  const handleEdit = () => {
    setEditData({
      login: profile.login || profile.name || '',
      email: profile.email || '',
    });
    setEditMode(true);
    setSuccess(null);
  };

  const handleCancel = () => {
    setEditMode(false);
    setError(null);
    setSuccess(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('token');
      await axios.put('/auth/update', {
        login: editData.login,
        email: editData.email,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile({ ...profile, login: editData.login, email: editData.email });
      // Atualiza user no localStorage mantendo o id
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...storedUser, login: editData.login, email: editData.email };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setEditMode(false);
      setSuccess('Perfil atualizado com sucesso!');
    } catch (err) {
      setError('Erro ao atualizar perfil.');
    } finally {
      setSaving(false);
    }
  };

  // Troca de senha
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('A nova senha e a confirmação não coincidem.');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setChangingPassword(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPasswordSuccess('Senha alterada com sucesso!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch (err: any) {
      setPasswordError(err?.response?.data?.message || 'Erro ao alterar senha.');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) return <Typography>Carregando perfil...</Typography>;
  if (error) return <Fade in={!!error}><Alert severity="error">{error}</Alert></Fade>;
  if (!profile) return <Typography>Nenhum dado de usuário encontrado.</Typography>;

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh" bgcolor="#f7f7fa">
      <Card sx={{ minWidth: 340, maxWidth: 420, p: 3, boxShadow: 4, borderRadius: 4 }}>
        <CardContent>
          <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64, mb: 1 }}>
              {(profile.login || profile.name || 'U').charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Meu Perfil
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Gerencie suas informações pessoais e segurança da conta.
            </Typography>
          </Box>

          {success && <Fade in={!!success}><Alert severity="success" sx={{ mb: 2 }}>{success}</Alert></Fade>}

          <Divider sx={{ mb: 2 }} />

          {editMode ? (
            <Stack spacing={2} sx={{ mb: 2 }}>
              <TextField
                label="Login"
                name="login"
                value={editData.login}
                onChange={handleChange}
                fullWidth
                InputProps={{ startAdornment: <PersonOutlineOutlinedIcon sx={{ mr: 1 }} /> }}
              />
              <TextField
                label="Email"
                name="email"
                value={editData.email}
                onChange={handleChange}
                fullWidth
                InputProps={{ startAdornment: <EmailOutlinedIcon sx={{ mr: 1 }} /> }}
              />
            </Stack>
          ) : (
            <Stack spacing={1} sx={{ mb: 2 }}>
              <Box display="flex" alignItems="center">
                <PersonOutlineOutlinedIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1"><b>Login:</b> {profile.login || profile.name}</Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <EmailOutlinedIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1"><b>Email:</b> {profile.email}</Typography>
              </Box>
            </Stack>
          )}

          {editMode ? (
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <Button variant="contained" color="primary" onClick={handleSave} disabled={saving} fullWidth startIcon={<EditOutlinedIcon />}>
                Salvar
              </Button>
              <Button variant="outlined" onClick={handleCancel} disabled={saving} fullWidth>
                Cancelar
              </Button>
            </Stack>
          ) : (
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <Button variant="outlined" color="primary" onClick={handleEdit} fullWidth startIcon={<EditOutlinedIcon />}>
                Editar
              </Button>
              <Button variant="outlined" color="secondary" onClick={() => setShowPasswordForm((v) => !v)} fullWidth startIcon={<LockOutlinedIcon />}>
                Alterar Senha
              </Button>
            </Stack>
          )}

          {showPasswordForm && (
            <Box mt={2}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="subtitle1" gutterBottom fontWeight={500}>
                Alterar Senha
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Senha Atual"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  fullWidth
                />
                <TextField
                  label="Nova Senha"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  fullWidth
                />
                <TextField
                  label="Confirmar Nova Senha"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  fullWidth
                />
                {passwordError && <Fade in={!!passwordError}><Alert severity="error">{passwordError}</Alert></Fade>}
                {passwordSuccess && <Fade in={!!passwordSuccess}><Alert severity="success">{passwordSuccess}</Alert></Fade>}
                <Stack direction="row" spacing={2}>
                  <Button variant="contained" color="primary" onClick={handlePasswordSubmit} disabled={changingPassword} fullWidth>
                    Salvar Senha
                  </Button>
                  <Button variant="outlined" onClick={() => setShowPasswordForm(false)} disabled={changingPassword} fullWidth>
                    Cancelar
                  </Button>
                </Stack>
              </Stack>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          <Button variant="contained" color="error" onClick={handleDelete} fullWidth>
            Excluir Conta
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Profile; 