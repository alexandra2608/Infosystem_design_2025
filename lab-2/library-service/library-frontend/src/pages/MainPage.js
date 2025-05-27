import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Container, Typography, Grid, Paper, Button,
    createTheme, ThemeProvider, Divider
} from '@mui/material';

const theme = createTheme({
    palette: {
        primary: {
            main: '#724ea5',
        },
        secondary: {
            main: '#548c60',
        },
    },
    typography: {
        subtitle1: {
            fontSize: '1.1rem',
            lineHeight: 1.6,
        },
    },
});

function HomePage() {
    const navigate = useNavigate();

    return (
        <ThemeProvider theme={theme}>
            <Box
                sx={{
                    backgroundImage: "url('/img_3.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: '100vh',
                    py: 4,
                    px: 2,
                    backdropFilter: 'blur(3px)',
                    backgroundColor: 'rgba(255,255,255,0.8)'
                }}
            >
                <Container maxWidth="lg">
                    <Typography
                        variant="h2"
                        gutterBottom
                        sx={{
                            fontWeight: 600,
                            color: '#444',
                            mb: 4,
                            textAlign: 'center',
                            textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                        }}
                    >
                        Библиотечная система
                    </Typography>

                    <Typography
                        variant="subtitle1"
                        sx={{
                            textAlign: 'center',
                            maxWidth: '800px',
                            mx: 'auto',
                            mb: 4,
                            color: '#252424'
                        }}
                    >
                        Современная система управления библиотекой, предоставляющая полный контроль
                        над книжным фондом, читателями и процессами выдачи литературы.
                        Наша платформа сочетает удобство использования с мощными функциями
                        для эффективной работы библиотеки любого масштаба.
                    </Typography>

                    <Divider sx={{ my: 3, borderColor: '#252424', width: '80%', mx: 'auto' }} />

                    <Grid container spacing={4} justifyContent="center">
                        <Grid item xs={12} sm={6} md={4}>
                            <Paper
                                elevation={3}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    bgcolor: '#f7f1f0',
                                    borderRadius: 3,
                                    transition: 'transform 0.3s',
                                    '&:hover': {
                                        transform: 'scale(1.03)'
                                    }
                                }}
                            >
                                <Typography variant="h5" gutterBottom sx={{ color: '#724ea5', fontWeight: 600 }}>
                                    Книги
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
                                    Управление каталогом книг, добавление, редактирование и поиск
                                </Typography>
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={() => navigate('/books')}
                                    sx={{
                                        backgroundColor: '#724ea5',
                                        '&:hover': {
                                            backgroundColor: '#5c2e88',
                                        }
                                    }}
                                >
                                    Перейти
                                </Button>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <Paper
                                elevation={3}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    bgcolor: '#f1f7f0',
                                    borderRadius: 3,
                                    transition: 'transform 0.3s',
                                    '&:hover': {
                                        transform: 'scale(1.03)'
                                    }
                                }}
                            >
                                <Typography variant="h5" gutterBottom sx={{ color: '#548c60', fontWeight: 600 }}>
                                    Участники
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
                                    Управление участниками библиотеки, регистрация и статистика
                                </Typography>
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={() => navigate('/members')}
                                    sx={{
                                        backgroundColor: '#548c60',
                                        '&:hover': {
                                            backgroundColor: '#365c3c',
                                        }
                                    }}
                                >
                                    Перейти
                                </Button>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <Paper
                                elevation={3}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    bgcolor: '#f1f0f7',
                                    borderRadius: 3,
                                    transition: 'transform 0.3s',
                                    '&:hover': {
                                        transform: 'scale(1.03)'
                                    }
                                }}
                            >
                                <Typography variant="h5" gutterBottom sx={{ color: '#614193', fontWeight: 600 }}>
                                    Выдачи
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
                                    Учет выдачи книг, возвратов и управление текущими займами
                                </Typography>
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={() => navigate('/loans')}
                                    sx={{
                                        backgroundColor: '#614193',
                                        '&:hover': {
                                            backgroundColor: '#4f3180',
                                        }
                                    }}
                                >
                                    Перейти
                                </Button>
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </ThemeProvider>
    );
}

export default HomePage;