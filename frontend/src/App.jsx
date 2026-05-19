import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { AppLayout } from './components/layout/AppLayout';
import { AdminSidebar } from './components/layout/AdminSidebar';

// Pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { SubscribePage } from './pages/SubscribePage';
import { DashboardPage } from './pages/DashboardPage';
import { CharitiesPage } from './pages/CharitiesPage';
import { AdminPage } from './pages/AdminPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminDrawsPage } from './pages/AdminDrawsPage';
import { AdminCharitiesPage } from './pages/AdminCharitiesPage';
import { AdminWinnersPage } from './pages/AdminWinnersPage';
import { PrizesPage } from './pages/PrizesPage';

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && user.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return children;
};

// Admin Layout wrapper
const AdminLayout = ({ children }) => {
  return (
    <div className="flex min-h-[calc(100vh-5rem)]">
      <AdminSidebar />
      <div className="flex-1 overflow-x-hidden">
        {children}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/charities" element={<CharitiesPage />} />
              <Route path="/prizes" element={<PrizesPage />} />
              
              <Route path="/subscribe" element={
                <ProtectedRoute>
                  <SubscribePage />
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />

              <Route path="/admin/*" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout>
                    <Routes>
                      <Route path="/" element={<AdminPage />} />
                      <Route path="/users" element={<AdminUsersPage />} />
                      <Route path="/draws" element={<AdminDrawsPage />} />
                      <Route path="/charities" element={<AdminCharitiesPage />} />
                      <Route path="/winners" element={<AdminWinnersPage />} />
                    </Routes>
                  </AdminLayout>
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
