import React, { useEffect, useState, useRef } from 'react';
import {
  Box, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider, Paper, TextField, IconButton, CircularProgress, Badge
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';

interface User {
  id: string;
  login: string;
  email: string;
}

interface Message {
  id: string;
  sender: User;
  receiver: User;
  content: string;
  timestamp: string;
  read: boolean;
}

const Chat: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Defina fetchConversations no topo do componente
  const fetchConversations = async () => {
    setLoadingConversations(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/messages', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: Message[] = await res.json();
      // Extrai usuários únicos das mensagens (enviadas e recebidas)
      const users: { [id: string]: User } = {};
      data.forEach(msg => {
        if (msg.sender.id !== user.id) users[msg.sender.id] = msg.sender;
        if (msg.receiver.id !== user.id) users[msg.receiver.id] = msg.receiver;
      });
      setConversations(Object.values(users));
    } catch (e) {
      // erro
    }
    setLoadingConversations(false);
  };

  // Busca conversas (usuários únicos)
  useEffect(() => {
    fetchConversations();
  }, [user.id]);

  // useEffect para atualizar inbox ao abrir o chat
  useEffect(() => {
    fetchConversations();
    // eslint-disable-next-line
  }, [user.id]);

  // useEffect para abrir conversa automaticamente se houver userId na query
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userId = params.get('userId');
    if (userId && (!selectedUser || selectedUser.id !== userId)) {
      // Tenta encontrar o usuário na lista de conversas
      const found = conversations.find(u => u.id === userId);
      if (found) {
        setSelectedUser(found);
      } else if (userId !== user.id) {
        // Busca usuário pelo id se não estiver na lista
        fetch(`/auth/user/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
          .then(res => res.json())
          .then(u => {
            if (u && u.id) setSelectedUser(u);
          });
      }
    }
    // eslint-disable-next-line
  }, [location.search, conversations]);

  // Função para buscar mensagens da conversa selecionada
  const fetchMessages = async (showLoading = false) => {
    if (!selectedUser) return;
    if (showLoading) setLoadingMessages(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/messages/conversation/${selectedUser.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: Message[] = await res.json();
      setMessages(data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
    } catch (e) {
      // erro
    }
    if (showLoading) setLoadingMessages(false);
    setInitialLoad(false);
  };

  // Atualização automática das mensagens (polling)
  useEffect(() => {
    if (!selectedUser) return;
    setInitialLoad(true);
    fetchMessages(true); // mostra loading só na primeira vez
    const interval = setInterval(() => {
      fetchMessages(false); // não mostra loading no polling
    }, 7000); // 7 segundos
    return () => clearInterval(interval);
  }, [selectedUser]);

  // Scroll automático para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !selectedUser) return;
    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ receiverId: selectedUser.id, content: message }),
      });
      if (res.ok) {
        setMessage('');
        // Recarrega mensagens
        const data: Message = await res.json();
        setMessages(prev => [...prev, data]);
      }
    } catch (e) {
      // erro
    }
    setSending(false);
  };

  return (
    <Box display="flex" height="80vh" bgcolor="#f7f7fa" borderRadius={2} boxShadow={2}>
      {/* Inbox */}
      <Paper sx={{ width: 320, minWidth: 220, maxWidth: 360, borderRight: '1px solid #eee', display: 'flex', flexDirection: 'column' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ p: 2, pb: 1 }}>
          <Typography variant="h6" fontWeight={600}>Conversas</Typography>
          <IconButton size="small" onClick={fetchConversations}><RefreshIcon /></IconButton>
        </Box>
        <Divider />
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {loadingConversations ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%"><CircularProgress /></Box>
          ) : (
            <List>
              {conversations.length === 0 && (
                <Typography sx={{ p: 2 }} color="text.secondary">Nenhuma conversa ainda.</Typography>
              )}
              {conversations.map((conv) => (
                <ListItem
                  button
                  key={conv.id}
                  selected={selectedUser?.id === conv.id}
                  onClick={() => setSelectedUser(conv)}
                  alignItems="flex-start"
                >
                  <ListItemAvatar>
                    <Badge color="primary" variant="dot" invisible={true}>
                      <Avatar>{conv.login?.charAt(0).toUpperCase()}</Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={conv.login}
                    secondary={conv.email}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Paper>

      {/* Chat */}
      <Box flex={1} display="flex" flexDirection="column" position="relative">
        {selectedUser ? (
          <>
            <Box sx={{ p: 2, borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar>{selectedUser.login?.charAt(0).toUpperCase()}</Avatar>
              <Typography variant="subtitle1" fontWeight={600}>{selectedUser.login}</Typography>
              <Typography variant="body2" color="text.secondary">{selectedUser.email}</Typography>
            </Box>
            <Box flex={1} p={2} overflow="auto" display="flex" flexDirection="column" gap={1} bgcolor="#f9f9fb">
              {initialLoad ? (
                <Box flex={1} display="flex" justifyContent="center" alignItems="center"><CircularProgress /></Box>
              ) : (
                messages.length === 0 ? (
                  <Typography color="text.secondary" align="center" mt={4}>Nenhuma mensagem ainda.</Typography>
                ) : (
                  messages.map((msg) => {
                    const isMine = String(msg.sender.id) === String(user.id);
                    console.log('[DEBUG] user.id:', user.id, 'msg.sender.id:', msg.sender.id, 'msg.receiver.id:', msg.receiver.id, 'isMine:', isMine);
                    return (
                      <Box
                        key={msg.id}
                        alignSelf={isMine ? 'flex-end' : 'flex-start'}
                        bgcolor={isMine ? 'primary.main' : 'grey.200'}
                        color={isMine ? 'white' : 'black'}
                        px={2} py={1} borderRadius={3} maxWidth="70%" mb={0.5}
                        boxShadow={isMine ? 2 : 1}
                      >
                        <Typography variant="body2">{msg.content}</Typography>
                        <Typography variant="caption" color={isMine ? 'rgba(255,255,255,0.7)' : 'text.secondary'}>
                          {new Date(msg.timestamp).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                        </Typography>
                      </Box>
                    );
                  })
                )
              )}
              <div ref={messagesEndRef} />
            </Box>
            <Divider />
            <Box display="flex" alignItems="center" p={2} gap={1}>
              <TextField
                fullWidth
                placeholder="Digite sua mensagem..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                disabled={sending}
                size="small"
                autoFocus
              />
              <IconButton color="primary" onClick={handleSend} disabled={sending || !message.trim()}>
                <SendIcon />
              </IconButton>
            </Box>
          </>
        ) : (
          <Box flex={1} display="flex" alignItems="center" justifyContent="center">
            <Typography color="text.secondary">Selecione uma conversa para começar</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Chat; 