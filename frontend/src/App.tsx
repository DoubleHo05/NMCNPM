import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import BookList from './pages/BookList';
import BookDetail from './pages/BookDetail';
import BookImport from './pages/BookImport';
import BookForm from './pages/BookForm';
import InvoiceCreate from './pages/InvoiceCreate';
import CashCollection from './pages/CashCollection';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import AccountSettings from './pages/AccountSettings';

// Import new authentication pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AuthLayout from './components/AuthLayout';

// Import utils
import './utils/time';

const App: React.FC = () => {
  // Simple authentication state management for demonstration
  // In a real app, this would be managed by a context or state management library
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <StoreProvider>
      <HashRouter>
        <Routes>
          {isAuthenticated ? (
            // Private Routes (Protected)
            <Route
              path="/*"
              element={
                <Layout onLogout={handleLogout}>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/books" element={<BookList />} />
                    <Route path="/books/detail/:id" element={<BookDetail />} />
                    <Route path="/books/new" element={<BookForm />} />
                    <Route path="/books/edit/:id" element={<BookForm />} />
                    <Route path="/books/import" element={<BookImport />} />
                    <Route path="/sales/invoice" element={<InvoiceCreate />} />
                    <Route path="/sales/collect" element={<CashCollection />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/account" element={<AccountSettings />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Layout>
              }
            />
          ) : (
            // Public Routes
            <Route
              path="/*"
              element={
                <AuthLayout>
                  <Routes>
                    <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                  </Routes>
                </AuthLayout>
              }
            />
          )}
        </Routes>
      </HashRouter>
    </StoreProvider>
  );
};

export default App;