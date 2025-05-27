import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import MembersPage from './pages/MembersPage';

const theme = createTheme({
    palette: {
        primary: {
            main: '#a3c9c7',
        },
        secondary: {
            main: '#f2d0c4',
        },
    },
    shape: {
        borderRadius: 12,
    },
    typography: {
        fontFamily: '"Montserrat", "Roboto", "Arial", sans-serif', // Шрифт
    },
});

export default function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <MembersPage />
        </ThemeProvider>
    );
}
