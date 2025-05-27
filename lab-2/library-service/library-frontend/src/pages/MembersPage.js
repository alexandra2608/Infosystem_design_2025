import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import NavigationBar from '../components/NavigationBar';
import {
    Container, Typography, TextField, Button, Paper, Table, TableHead,
    TableBody, TableRow, TableCell, Grid, Snackbar, Alert, Box, Toolbar
} from '@mui/material';

const CREATE_MEMBER = gql`
  mutation($name: String!, $email: String!, $phone: String) { 
    createMember(name: $name, email: $email, phone: $phone) {
      id
      name
      email
      phone
      membershipDate
    }
  }
`;

const GET_MEMBERS = gql`
  query {
    members {
      id
      name
      email
      phone
      membershipDate
    }
  }
`;

const GET_MEMBER_BY_ID = gql`
  query($id: ID!) {
    member(id: $id) {
      id
      name
      email
      phone
      membershipDate
    }
  }
`;

const UPDATE_MEMBER = gql`
  mutation($id: ID!, $name: String, $email: String, $phone: String) {
    updateMember(id: $id, name: $name, email: $email, phone: $phone) {
      id
      name
      email
      phone
      membershipDate
    }
  }
`;


const DELETE_MEMBER = gql`
  mutation($id: ID!) {
    deleteMember(id: $id)
  }
`;

export default function MembersPage() {
    const { data, loading, error, refetch } = useQuery(GET_MEMBERS);
    const [createMember] = useMutation(CREATE_MEMBER);
    const [deleteMember] = useMutation(DELETE_MEMBER);
    const [searchId, setSearchId] = useState('');
    const [searchedMember, setSearchedMember] = useState(null);
    const [searchError, setSearchError] = useState(null);

    const { refetch: fetchMemberById } = useQuery(GET_MEMBER_BY_ID, {
        skip: true,
    });

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [editingMember, setEditingMember] = useState(null);
    const [updateMember] = useMutation(UPDATE_MEMBER);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const handleCreate = async () => {
        if (!name || !email) {
            setSnackbar({ open: true, message: 'Пожалуйста, введите имя и Email', severity: 'warning' });
            return;
        }
        try {
            await createMember({ variables: { name, email, phone } });
            setName('');
            setEmail('');
            setPhone('');
            refetch();
            setSnackbar({ open: true, message: 'Участник добавлен', severity: 'success' });
        } catch (e) {
            console.error("Ошибка при добавлении:", e);
            setSnackbar({ open: true, message: `Ошибка при добавлении: ${e.message}`, severity: 'error' });
        }
    };

    const handleSearchById = async () => {
        if (!searchId) return;
        try {
            const { data } = await fetchMemberById({ id: searchId });
            if (data?.member) {
                setSearchedMember(data.member);
                setSearchError(null);
            } else {
                setSearchedMember(null);
                setSearchError('Участник не найден');
            }
        } catch (err) {
            console.error(err);
            setSearchError('Ошибка при поиске');
        }
    };

    const handleEdit = (member) => {
        setEditingMember(member);
        setName(member.name);
        setEmail(member.email);
        setPhone(member.phone || '');
    };

    const handleUpdate = async () => {
        try {
            await updateMember({
                variables: {
                    id: editingMember.id,
                    name,
                    email,
                    phone
                }
            });
            setSnackbar({ open: true, message: 'Участник обновлён', severity: 'success' });
            setEditingMember(null);
            setName('');
            setEmail('');
            setPhone('');
            refetch();
        } catch (e) {
            console.error("Ошибка при обновлении:", e);
            setSnackbar({ open: true, message: `Ошибка: ${e.message}`, severity: 'error' });
        }
    };


    const handleDelete = async (id) => {
        try {
            await deleteMember({ variables: { id } });
            refetch();
            setSnackbar({ open: true, message: 'Участник удалён', severity: 'info' });
        } catch (e) {
            console.error("Ошибка при удалении:", e);
            setSnackbar({ open: true, message: `Ошибка при удалении: ${e.message}`, severity: 'error' });
        }
    };

    if (loading) return <Typography>Загрузка...</Typography>;
    if (error) return <Typography color="error">Ошибка: {error.message}</Typography>;

    return (
        <Box
            sx={{
                backgroundImage: "url('/img_1.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: '100vh',
                py: 4,
                px: 2,
                backdropFilter: 'blur(3px)',
                backgroundColor: 'rgba(255,255,255,0.8)'
            }}
        >
            <NavigationBar />
            <Toolbar />
            <Container maxWidth="lg">
                <Typography
                    variant="h3"
                    gutterBottom
                    sx={{ fontWeight: 600, color: '#444', mt: 4, mb: 4 }}
                >
                    Library members
                </Typography>

                <Paper
                    elevation={3}
                    sx={{
                        p: 3,
                        mb: 4,
                        bgcolor: '#f7f1f0',
                        borderRadius: 3
                    }}
                >
                    <Typography variant="h6" gutterBottom>➕ Добавить участника</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Имя"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                fullWidth
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                fullWidth
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <TextField
                                label="Телефон"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                fullWidth
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <Button
                                variant="contained"
                                sx={{
                                    height: '100%',
                                    backgroundColor: editingMember ? '#548c60' : '#724ea5',
                                    '&:hover': {
                                        backgroundColor: editingMember ? '#365c3c' : '#5c2e88',
                                    }
                                }}
                                fullWidth
                                onClick={editingMember ? handleUpdate : handleCreate}
                            >
                                {editingMember ? 'Сохранить' : 'Добавить'}
                            </Button>

                        </Grid>
                    </Grid>
                </Paper>

                <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: '#f3eaff', borderRadius: 3 }}>
                    <Typography variant="h6" gutterBottom>🔍 Найти участника по ID</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="ID участника"
                                value={searchId}
                                onChange={e => setSearchId(e.target.value)}
                                fullWidth
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={handleSearchById}
                                sx={{
                                    height: '100%',
                                    backgroundColor: '#724ea5',
                                    '&:hover': {
                                        backgroundColor: '#5c2e88',
                                    }
                                }}
                            >
                                Найти
                            </Button>
                        </Grid>
                    </Grid>

                    {searchError && (
                        <Typography color="error" sx={{ mt: 2 }}>{searchError}</Typography>
                    )}

                    {searchedMember && (
                        <Box mt={2} p={2} sx={{ bgcolor: '#fff', borderRadius: 2, boxShadow: 1 }}>
                            <Typography variant="subtitle1"><b>Информация об участнике:</b></Typography>
                            <Typography>ID: {searchedMember.id}</Typography>
                            <Typography>Имя: {searchedMember.name}</Typography>
                            <Typography>Email: {searchedMember.email}</Typography>
                            <Typography>Телефон: {searchedMember.phone || '—'}</Typography>
                            <Typography>Дата вступления: {new Date(searchedMember.membershipDate).toLocaleDateString()}</Typography>
                        </Box>
                    )}
                </Paper>

                <Paper elevation={3} sx={{ p: 3, bgcolor: '#fff', borderRadius: 3 }}>
                    <Typography variant="h6" gutterBottom>👥 Список участников</Typography>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><b>ID</b></TableCell>
                                <TableCell><b>Имя</b></TableCell>
                                <TableCell><b>Email</b></TableCell>
                                <TableCell><b>Телефон</b></TableCell>
                                <TableCell><b>Дата вступления</b></TableCell>
                                <TableCell align="center"><b>Действия</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.members.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell>{member.id}</TableCell>
                                    <TableCell>{member.name}</TableCell>
                                    <TableCell>{member.email}</TableCell>
                                    <TableCell>{member.phone || '—'}</TableCell>
                                    <TableCell>{new Date(member.membershipDate).toLocaleDateString()}</TableCell>
                                    <TableCell align="center">
                                        <Grid container spacing={1} justifyContent="center">
                                            <Grid item>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={() => handleEdit(member)}
                                                    sx={{
                                                        borderColor: '#614193',
                                                        color: '#614193',
                                                        '&:hover': {
                                                            backgroundColor: '#f5efff',
                                                            borderColor: '#4f3180',
                                                            color: '#4f3180',
                                                        }
                                                    }}
                                                >
                                                    Редактировать
                                                </Button>
                                            </Grid>
                                            <Grid item>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={() => handleDelete(member.id)}
                                                    color="error"
                                                >
                                                    Удалить
                                                </Button>
                                            </Grid>
                                        </Grid>

                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={4000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Container>
        </Box>
    );
}