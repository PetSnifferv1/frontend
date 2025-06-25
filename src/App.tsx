import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/theme';
import Layout from '@/components/Layout';
import Home from '@/components/Home';
import Login from '@/components/Login';
import Register from '@/components/Register';
import Pets from '@/components/Pets';
import PublicPets from '@/components/PublicPets';
import SearchByLocation from '@/components/SearchByLocation';
import PrivateRoute from '@/components/PrivateRoute';
import { AuthProvider } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Box } from '@mui/material';
import PetsSimilares from '@/components/PetsSimilares';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Box sx={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
            <Header />
            <Box sx={{ paddingTop: '64px' }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/pets"
                  element={
                    <PrivateRoute>
                      <Pets />
                    </PrivateRoute>
                  }
                />
                <Route path="/pets/public-pets" element={<PublicPets />} />
                <Route path="/search-by-location" element={<SearchByLocation />} />
                <Route path="/pets/similares/:petId" element={<PetsSimilares />} />
              </Routes>
            </Box>
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
