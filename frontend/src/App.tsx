import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
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
import UserManagement from './pages/UserManagement';

// Import new authentication pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AuthLayout from './components/AuthLayout';

// Import utils
import './utils/time';

// Loading component
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-100">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

// Main app content with auth check
const AppContent: React.FC = () => {
  const { isLoggedIn, isLoading, logout } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {isLoggedIn ? (
        // Private Routes (Protected)
        <Route
          path="/*"
          element={
            <Layout onLogout={logout}>
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
                <Route path="/users" element={
                  <ProtectedRoute allowedRoles={['QUAN_LY']}>
                    <UserManagement />
                  </ProtectedRoute>
                } />
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
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </AuthLayout>
          }
        />
      )}
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <StoreProvider>
        <HashRouter>
          <AppContent />
        </HashRouter>
      </StoreProvider>
    </AuthProvider>
  );
};

export default App;