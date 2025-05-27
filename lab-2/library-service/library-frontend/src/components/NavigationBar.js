import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';

export default function NavigationBar() {
    const navigate = useNavigate();

    return (
        <AppBar position="fixed" sx={{ mb: 4, bgcolor: '#6d8373' }}>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Библиотечная система
                </Typography>
                <Box sx={{ display: 'flex' }}>
                    <Button color="inherit" onClick={() => navigate('/')} sx={{ mx: 1 }}>
                        Главная
                    </Button>
                    <Button color="inherit" onClick={() => navigate('/books')} sx={{ mx: 1 }}>
                        Книги
                    </Button>
                    <Button color="inherit" onClick={() => navigate('/members')} sx={{ mx: 1 }}>
                        Участники
                    </Button>
                    <Button color="inherit" onClick={() => navigate('/loans')} sx={{ mx: 1 }}>
                        Выдачи
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
}