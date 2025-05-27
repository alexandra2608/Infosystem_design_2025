import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApolloClient } from '@apollo/client';
import { useQuery, useMutation, gql } from '@apollo/client';
import NavigationBar from '../components/NavigationBar';
import {
    Container, Typography, TextField, Button, Paper, Table, TableHead,
    TableBody, TableRow, TableCell, Grid, Snackbar, Alert, Box, Tabs, Tab, Toolbar
} from '@mui/material';

const CREATE_LOAN = gql`
    mutation($memberId: ID!, $bookId: ID!, $loanDate: String!, $status: String!) {
        createLoan(memberId: $memberId, bookId: $bookId, loanDate: $loanDate, status: $status) {
            id
            memberId
            bookId
            loanDate
            returnDate
            status
        }
    }
`;

const GET_LOANS = gql`
    query {
        loans {
            id
            memberId
            bookId
            loanDate
            returnDate
            status
        }
    }
`;

const GET_LOAN_BY_ID = gql`
    query($id: ID!) {
        loan(id: $id) {
            id
            memberId
            bookId
            loanDate
            returnDate
            status
        }
    }
`;

const GET_LOANS_BY_MEMBER = gql`
    query($memberId: ID!) {
        loansByMember(memberId: $memberId) {
            id
            memberId
            bookId
            loanDate
            returnDate
            status
        }
    }
`;

const GET_LOANS_BY_BOOK = gql`
    query($bookId: ID!) {
        loansByBook(bookId: $bookId) {
            id
            memberId
            bookId
            loanDate
            returnDate
            status
        }
    }
`;

const UPDATE_LOAN = gql`
    mutation($id: ID!, $returnDate: String, $status: String) {
        updateLoan(id: $id, returnDate: $returnDate, status: $status) {
            id
            memberId
            bookId
            loanDate
            returnDate
            status
        }
    }
`;

const DELETE_LOAN = gql`
  mutation($id: ID!) {
    deleteLoan(id: $id)
  }
`;

export default function LoanPage() {
    const navigate = useNavigate()
    const client = useApolloClient();
    const { data, loading, error, refetch } = useQuery(GET_LOANS);
    const [createLoan] = useMutation(CREATE_LOAN);
    const [updateLoan] = useMutation(UPDATE_LOAN);
    const [deleteLoan] = useMutation(DELETE_LOAN);
    const [searchId, setSearchId] = useState('');
    const [searchedLoan, setSearchedLoan] = useState(null);
    const [searchError, setSearchError] = useState(null);

    const { refetch: fetchLoanById } = useQuery(GET_LOAN_BY_ID, {
        skip: true,
    });
    const [searchMemberId, setSearchMemberId] = useState('');
    const [searchBookId, setSearchBookId] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchType, setSearchType] = useState('loan');
    const [activeTab, setActiveTab] = useState(0);
    const [memberId, setMemberId] = useState('');
    const [bookId, setBookId] = useState('');
    const [loanDate, setLoanDate] = useState('');
    const [returnDate, setReturnDate] = useState('');
    const [status, setStatus] = useState('');
    const [editingLoan, setEditingLoan] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const handleCreate = async () => {
        if (!memberId || !bookId || !loanDate || !status) {
            setSnackbar({ open: true, message: 'Пожалуйста, заполните все обязательные поля', severity: 'warning' });
            return;
        }
        try {
            await createLoan({ variables: { memberId, bookId, loanDate, status } });
            setMemberId('');
            setBookId('');
            setLoanDate('');
            setReturnDate('');
            setStatus('');
            refetch();
            setSnackbar({ open: true, message: 'Выдача добавлена', severity: 'success' });
        } catch (e) {
            console.error("Ошибка при добавлении:", e);
            setSnackbar({ open: true, message: `Ошибка при добавлении: ${e.message}`, severity: 'error' });
        }
    };

    const handleSearchById = async () => {
        if (!searchId) return;
        try {
            console.log('Searching for loan with ID:', searchId);
            const { data, errors } = await client.query({
                query: GET_LOAN_BY_ID,
                variables: { id: searchId },
            });
            console.log('Search response:', { data, errors });

            if (data?.loan) {
                setSearchedLoan(data.loan);
                setSearchError(null);
            } else {
                setSearchedLoan(null);
                setSearchError('Выдача не найдена');
            }
        } catch (err) {
            console.error("Search error:", err);
            setSearchError('Ошибка при поиске: ' + err.message);
        }
    };

    const handleSearchByMember = async () => {
        if (!searchMemberId) return;
        try {
            const { data } = await client.query({
                query: GET_LOANS_BY_MEMBER,
                variables: { memberId: searchMemberId },
            });
            setSearchResults(data.loansByMember);
            setSearchError(null);
        } catch (err) {
            console.error(err);
            setSearchError('Ошибка при поиске по участнику');
        }
    };

    const handleSearchByBook = async () => {
        if (!searchBookId) return;
        try {
            const { data } = await client.query({
                query: GET_LOANS_BY_BOOK,
                variables: { bookId: searchBookId },
            });
            setSearchResults(data.loansByBook);
            setSearchError(null);
        } catch (err) {
            console.error(err);
            setSearchError('Ошибка при поиске по книге');
        }
    };

    const handleEdit = (loan) => {
        setEditingLoan(loan);
        setMemberId(loan.memberId);
        setBookId(loan.bookId);
        setLoanDate(loan.loanDate);
        setReturnDate(loan.returnDate || '');
        setStatus(loan.status);
    };

    const handleUpdate = async () => {
        try {
            await updateLoan({
                variables: {
                    id: editingLoan.id,
                    returnDate: returnDate || null,
                    status
                }
            });
            setSnackbar({ open: true, message: 'Выдача обновлена', severity: 'success' });
            setEditingLoan(null);
            setMemberId('');
            setBookId('');
            setLoanDate('');
            setReturnDate('');
            setStatus('');
            refetch();
        } catch (e) {
            console.error("Ошибка при обновлении:", e);
            setSnackbar({ open: true, message: `Ошибка: ${e.message}`, severity: 'error' });
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteLoan({ variables: { id } });
            refetch();
            setSnackbar({ open: true, message: 'Выдача удалена', severity: 'info' });
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
                backgroundImage: "url('/img.png')",
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
                    Loans
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
                    <Typography variant="h6" gutterBottom>➕ Добавить выдачу</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                label="ID участника"
                                value={memberId}
                                onChange={e => setMemberId(e.target.value)}
                                fullWidth
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                label="ID книги"
                                value={bookId}
                                onChange={e => setBookId(e.target.value)}
                                fullWidth
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                label="Дата выдачи"
                                value={loanDate}
                                onChange={e => setLoanDate(e.target.value)}
                                fullWidth
                                variant="outlined"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                label="Статус"
                                value={status}
                                onChange={e => setStatus(e.target.value)}
                                fullWidth
                                variant="outlined"
                                select
                                SelectProps={{ native: true }}
                            >
                                <option value=""></option>
                                <option value="active">Активна</option>
                                <option value="returned">Возвращена</option>
                                <option value="overdue">Просрочена</option>
                            </TextField>
                        </Grid>
                        {editingLoan && (
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    label="Дата возврата"
                                    value={returnDate}
                                    onChange={e => setReturnDate(e.target.value)}
                                    fullWidth
                                    variant="outlined"
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                        )}
                        <Grid item xs={12} sm={2}>
                            <Button
                                variant="contained"
                                sx={{
                                    height: '100%',
                                    backgroundColor: editingLoan ? '#548c60' : '#724ea5',
                                    '&:hover': {
                                        backgroundColor: editingLoan ? '#365c3c' : '#5c2e88',
                                    }
                                }}
                                fullWidth
                                onClick={editingLoan ? handleUpdate : handleCreate}
                            >
                                {editingLoan ? 'Сохранить' : 'Добавить'}
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: '#f3eaff', borderRadius: 3 }}>
                    <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                        <Tab label="По ID выдачи" />
                        <Tab label="По ID участника" />
                        <Tab label="По ID книги" />
                    </Tabs>

                    {activeTab === 0 && (
                        <div>
                            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>🔍 Найти выдачу по ID</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        label="ID выдачи"
                                        value={searchId}
                                        onChange={e => setSearchId(e.target.value)}
                                        fullWidth
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={2}>
                                    <Button
                                        variant="contained"
                                        onClick={handleSearchById}
                                        sx={{
                                            height: '100%',
                                            backgroundColor: '#724ea5',
                                            '&:hover': { backgroundColor: '#5c2e88' }
                                        }}
                                        fullWidth
                                    >
                                        Найти
                                    </Button>
                                </Grid>
                            </Grid>
                        </div>
                    )}

                    {activeTab === 1 && (
                        <div>
                            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>🔍 Найти выдачи по участнику</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        label="ID участника"
                                        value={searchMemberId}
                                        onChange={e => setSearchMemberId(e.target.value)}
                                        fullWidth
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={2}>
                                    <Button
                                        variant="contained"
                                        onClick={handleSearchByMember}
                                        sx={{
                                            height: '100%',
                                            backgroundColor: '#724ea5',
                                            '&:hover': { backgroundColor: '#5c2e88' }
                                        }}
                                        fullWidth
                                    >
                                        Найти
                                    </Button>
                                </Grid>
                            </Grid>
                        </div>
                    )}

                    {activeTab === 2 && (
                        <div>
                            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>🔍 Найти выдачи по книге</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        label="ID книги"
                                        value={searchBookId}
                                        onChange={e => setSearchBookId(e.target.value)}
                                        fullWidth
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={2}>
                                    <Button
                                        variant="contained"
                                        onClick={handleSearchByBook}
                                        sx={{
                                            height: '100%',
                                            backgroundColor: '#724ea5',
                                            '&:hover': { backgroundColor: '#5c2e88' }
                                        }}
                                        fullWidth
                                    >
                                        Найти
                                    </Button>
                                </Grid>
                            </Grid>
                        </div>
                    )}

                    {searchError && (
                        <Typography color="error" sx={{ mt: 2 }}>
                            {searchError}
                        </Typography>
                    )}

                    {activeTab === 0 && searchedLoan && (
                        <Box mt={2} p={2} sx={{ bgcolor: '#fff', borderRadius: 2, boxShadow: 1 }}>
                            <Typography variant="subtitle1"><b>Найденная выдача:</b></Typography>
                            <Typography>ID: {searchedLoan.id}</Typography>
                            <Typography>ID участника: {searchedLoan.memberId}</Typography>
                            <Typography>ID книги: {searchedLoan.bookId}</Typography>
                            <Typography>Дата выдачи: {searchedLoan.loanDate}</Typography>
                            <Typography>Дата возврата: {searchedLoan.returnDate || 'Не возвращена'}</Typography>
                            <Typography>Статус: {searchedLoan.status}</Typography>
                        </Box>
                    )}

                    {(activeTab === 1 || activeTab === 2) && searchResults.length > 0 && (
                        <Box mt={2}>
                            {searchResults.map((loan) => (
                                <Box key={loan.id} mt={2} p={2} sx={{ bgcolor: '#fff', borderRadius: 2, boxShadow: 1 }}>
                                    <Typography variant="subtitle1"><b>Найденная выдача:</b></Typography>
                                    <Typography>ID {activeTab === 1 ? 'книги' : 'участника'}: {activeTab === 1 ? loan.bookId : loan.memberId}</Typography>
                                    <Typography>Дата выдачи: {loan.loanDate}</Typography>
                                    <Typography>Дата возврата: {loan.returnDate || 'Не возвращена'}</Typography>
                                    <Typography>Статус: {loan.status}</Typography>
                                </Box>
                            ))}
                        </Box>
                    )}
                </Paper>

                <Paper elevation={3} sx={{ p: 3, bgcolor: '#fff', borderRadius: 3 }}>
                    <Typography variant="h6" gutterBottom>📋 Список выдач</Typography>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><b>ID</b></TableCell>
                                <TableCell><b>ID участника</b></TableCell>
                                <TableCell><b>ID книги</b></TableCell>
                                <TableCell><b>Дата выдачи</b></TableCell>
                                <TableCell><b>Дата возврата</b></TableCell>
                                <TableCell><b>Статус</b></TableCell>
                                <TableCell align="center"><b>Действия</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data?.loans?.map((loan) => (
                                <TableRow key={loan.id}>
                                    <TableCell>{loan.id}</TableCell>
                                    <TableCell>{loan.memberId}</TableCell>
                                    <TableCell>{loan.bookId}</TableCell>
                                    <TableCell>{loan.loanDate}</TableCell>
                                    <TableCell>{loan.returnDate || '-'}</TableCell>
                                    <TableCell>{loan.status}</TableCell>
                                    <TableCell align="center">
                                        <Grid container spacing={1} justifyContent="center">
                                            <Grid item>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={() => handleEdit(loan)}
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
                                                    onClick={() => handleDelete(loan.id)}
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
                    <Alert
                        onClose={() => setSnackbar({ ...snackbar, open: false })}
                        severity={snackbar.severity}
                        sx={{ width: '100%' }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Container>
        </Box>
    );
}