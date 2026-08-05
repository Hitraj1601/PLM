import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Toast from './components/ui/Toast';
import useAuthStore from './store/authStore';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const BOMPage = lazy(() => import('./pages/BOMPage'));
const ECOPage = lazy(() => import('./pages/ECOPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

// Custom component to protect routes that require authentication
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  
  // If the user is not authenticated, redirect them to the landing page
  if (!isAuthenticated) return <Navigate to="/landing" replace />;
  
  return children;
}

// Custom component to restrict auth pages (login/signup) to unauthenticated users only
function PublicOnlyRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  
  // If the user is already authenticated, redirect them to the app root
  if (isAuthenticated) return <Navigate to="/" replace />;
  
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toast />
      
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen bg-navy-950">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-sienna-500 border-t-navy-950 rounded-full animate-spin" />
            <span className="text-gainsboro-400 text-sm">Loading...</span>
          </div>
        </div>
      }>
        <Routes>
          {/* Public Landing & Auth routes */}
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
          <Route path="/signup" element={<PublicOnlyRoute><SignupPage /></PublicOnlyRoute>} />
          
          {/* Protected route group: everything under "/" requires authentication to access */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                {/* Layout component wraps all authenticated pages */}
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Index route: displays the Dashboard when navigating to the exact root URL "/" */}
            <Route index element={<DashboardPage />} />
            
            {/* Nested routes for specific application features */}
            <Route path="products" element={<ProductsPage />} />
            <Route path="bom" element={<BOMPage />} />
            <Route path="eco" element={<ECOPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          
          {/* Fallback route: redirects any unknown URL back to the root "/" */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
