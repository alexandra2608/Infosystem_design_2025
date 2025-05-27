import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MembersPage from './pages/MembersPage';
import BooksPage from './pages/BooksPage';
import LoansPage from './pages/LoansPage';
import MainPage from "./pages/MainPage";

function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/loans" element={<LoansPage />} />
        </Routes>
      </Router>
  );
}

export default App;
