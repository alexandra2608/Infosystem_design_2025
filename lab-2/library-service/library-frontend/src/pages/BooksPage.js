import React, { useState } from 'react';
import { useApolloClient } from '@apollo/client';
import { useQuery, useMutation, gql } from '@apollo/client';
import NavigationBar from '../components/NavigationBar';
import {
    Container, Typography, TextField, Button, Paper, Table, TableHead,
    TableBody, TableRow, TableCell, Grid, Snackbar, Alert, Toolbar, Box
} from '@mui/material';

const CREATE_BOOK = gql`
    mutation($title: String!, $author: String!, $isbn: String!, $publishedYear: Int!, $copiesAvailable: Int!, $genre: String) {
        createBook(title: $title, author: $author, isbn: $isbn, publishedYear: $publishedYear, copiesAvailable: $copiesAvailable, genre: $genre) {
            id
            title
            author
            isbn
            publishedYear
            copiesAvailable
            genre
        }
    }
`;

const GET_BOOKS = gql`
    query {
        books {
            id
            title
            author
            isbn
            publishedYear
            copiesAvailable
            genre
        }
    }
`;

const GET_BOOK_BY_ID = gql`
    query($id: ID!) {
        book(id: $id) {
            id
            title
            author
            isbn
            publishedYear
            copiesAvailable
            genre
        }
    }
`;

const UPDATE_BOOK = gql`
    mutation($id: ID!, $title: String!, $author: String!, $isbn: String!, $publishedYear: Int!, $copiesAvailable: Int!, $genre: String) {
        updateBook(id: $id, title: $title, author: $author, isbn: $isbn, publishedYear: $publishedYear, copiesAvailable: $copiesAvailable, genre: $genre) {
            id
            title
            author
            isbn
            publishedYear
            copiesAvailable
            genre
        }
    }
`;

const DELETE_BOOK = gql`
  mutation($id: ID!) {
    deleteBook(id: $id)
  }
`;

export default function BookPage() {
    const client = useApolloClient();
    const { data, loading, error, refetch } = useQuery(GET_BOOKS);
    const [createBook] = useMutation(CREATE_BOOK);
    const [updateBook] = useMutation(UPDATE_BOOK);
    const [deleteBook] = useMutation(DELETE_BOOK);
    const [searchId, setSearchId] = useState('');
    const [searchedBook, setSearchedBook] = useState(null);
    const [searchError, setSearchError] = useState(null);

    const { refetch: fetchBookById } = useQuery(GET_BOOK_BY_ID, {
        skip: true,
    });

    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [isbn, setIsbn] = useState('');
    const [publishedYear, setPublishedYear] = useState('');
    const [copiesAvailable, setCopiesAvailable] = useState('');
    const [genre, setGenre] = useState('');
    const [editingBook, setEditingBook] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const handleCreate = async () => {
        if (!title || !author || !isbn || !publishedYear || !copiesAvailable) {
            setSnackbar({ open: true, message: 'Пожалуйста, заполните все обязательные поля', severity: 'warning' });
            return;
        }
        try {
            await createBook({ variables: { title, author, isbn, publishedYear: parseInt(publishedYear), copiesAvailable: parseInt(copiesAvailable), genre } });
            setTitle('');
            setAuthor('');
            setIsbn('');
            setPublishedYear('');
            setCopiesAvailable('');
            setGenre('');
            refetch();
            setSnackbar({ open: true, message: 'Книга добавлена', severity: 'success' });
        } catch (e) {
            console.error("Ошибка при добавлении:", e);
            setSnackbar({ open: true, message: `Ошибка при добавлении: ${e.message}`, severity: 'error' });
        }
    };

    const handleSearchById = async () => {
        if (!searchId) return;
        try {
            const { data } = await client.query({
                query: GET_BOOK_BY_ID,
                variables: { id: searchId },
            });
            if (data?.book) {
                setSearchedBook(data.book);
                setSearchError(null);
            } else {
                setSearchedBook(null);
                setSearchError('Книга не найдена');
            }
        } catch (err) {
            console.error(err);
            setSearchError('Ошибка при поиске');
        }
    };

    const handleEdit = (book) => {
        setEditingBook(book);
        setTitle(book.title);
        setAuthor(book.author);
        setIsbn(book.isbn);
        setPublishedYear(book.publishedYear.toString());
        setCopiesAvailable(book.copiesAvailable.toString());
        setGenre(book.genre || '');
    };

    const handleUpdate = async () => {
        try {
            await updateBook({
                variables: {
                    id: editingBook.id,
                    title,
                    author,
                    isbn,
                    publishedYear: parseInt(publishedYear),
                    copiesAvailable: parseInt(copiesAvailable),
                    genre
                }
            });
            setSnackbar({ open: true, message: 'Книга обновлена', severity: 'success' });
            setEditingBook(null);
            setTitle('');
            setAuthor('');
            setIsbn('');
            setPublishedYear('');
            setCopiesAvailable('');
            setGenre('');
            refetch();
        } catch (e) {
            console.error("Ошибка при обновлении:", e);
            setSnackbar({ open: true, message: `Ошибка: ${e.message}`, severity: 'error' });
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteBook({ variables: { id } });
            refetch();
            setSnackbar({ open: true, message: 'Книга удалена', severity: 'info' });
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
                backgroundImage: "url('/img_2.png')",
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
                    Books
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
                    <Typography variant="h6" gutterBottom>➕ Добавить книгу</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Название"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                fullWidth
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Автор"
                                value={author}
                                onChange={e => setAuthor(e.target.value)}
                                fullWidth
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="ISBN"
                                value={isbn}
                                onChange={e => setIsbn(e.target.value)}
                                fullWidth
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Год публикации"
                                value={publishedYear}
                                onChange={e => setPublishedYear(e.target.value)}
                                fullWidth
                                variant="outlined"
                                type="number"
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Доступные копии"
                                value={copiesAvailable}
                                onChange={e => setCopiesAvailable(e.target.value)}
                                fullWidth
                                variant="outlined"
                                type="number"
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Жанр"
                                value={genre}
                                onChange={e => setGenre(e.target.value)}
                                fullWidth
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <Button
                                variant="contained"
                                sx={{
                                    height: '100%',
                                    backgroundColor: editingBook ? '#548c60' : '#724ea5',
                                    '&:hover': {
                                        backgroundColor: editingBook ? '#365c3c' : '#5c2e88',
                                    }
                                }}
                                fullWidth
                                onClick={editingBook ? handleUpdate : handleCreate}
                            >
                                {editingBook ? 'Сохранить' : 'Добавить'}
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: '#f3eaff', borderRadius: 3 }}>
                    <Typography variant="h6" gutterBottom>🔍 Найти книгу по ID</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="ID книги"
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
                    <Typography color="error" sx={{ mt: 2 }}>
                        {searchError}
                    </Typography>
                )}
                    {searchedBook && (
                        <Box mt={2} p={2} sx={{ bgcolor: '#fff', borderRadius: 2, boxShadow: 1 }}>
                            <Typography variant="subtitle1"><b>Найденная книга:</b></Typography>
                            <Typography>ID: {searchedBook.id}</Typography>
                            <Typography>Название: {searchedBook.title}</Typography>
                            <Typography>Автор: {searchedBook.author}</Typography>
                            <Typography>ISBN: {searchedBook.isbn}</Typography>
                            <Typography>Год издания: {searchedBook.publishedYear}</Typography>
                            <Typography>Доступные экземпляры: {searchedBook.copiesAvailable}</Typography>
                            <Typography>Жанр: {searchedBook.genre}</Typography>
                        </Box>
                    )}
            </Paper>

            <Paper elevation={3} sx={{ p: 3, bgcolor: '#fff', borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom>📚 Список книг</Typography>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><b>ID</b></TableCell>
                            <TableCell><b>Название</b></TableCell>
                            <TableCell><b>Автор</b></TableCell>
                            <TableCell><b>ISBN</b></TableCell>
                            <TableCell><b>Год</b></TableCell>
                            <TableCell><b>Копии</b></TableCell>
                            <TableCell><b>Жанр</b></TableCell>
                            <TableCell align="center"><b>Действия</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.books.map((book) => (
                            <TableRow key={book.id}>
                                <TableCell>{book.id}</TableCell>
                                <TableCell>{book.title}</TableCell>
                                <TableCell>{book.author}</TableCell>
                                <TableCell>{book.isbn}</TableCell>
                                <TableCell>{book.publishedYear}</TableCell>
                                <TableCell>{book.copiesAvailable}</TableCell>
                                <TableCell>{book.genre}</TableCell>
                                <TableCell align="center">
                                    <Grid container spacing={1} justifyContent="center">
                                        <Grid item>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => handleEdit(book)}
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
                                                onClick={() => handleDelete(book.id)}
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
