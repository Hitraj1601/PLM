import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Toast from './components/ui/Toast';
import useAuthStore from './store/authStore';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const BOMPage = lazy(() => import('./pages/BOMPage'));
const ECOPage = lazy(() => import('./pages/ECOPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

// Custom component to protect routes that require authentication
function ProtectedRoute({ children }) {
  // Get the authentication status from the global auth store
  const { isAuthenticated } = useAuthStore();
  
  // If the user is not authenticated, redirect them to the login page
  // 'replace' ensures that this redirect doesn't add a new entry to the browser history
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  // If authenticated, render the children components (i.e., the protected routes)
  return children;
}

export default function App() {
  return (
    // Wrap the entire application in BrowserRouter to enable client-side routing
    <BrowserRouter>
      {/* Toast component for displaying non-blocking notifications to the user */}
      <Toast />
      
      {/* Define the main routing switch that decides which component to render based on URL */}
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen bg-navy-900">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-sienna-500 border-t-navy-900 rounded-full animate-spin" />
            <span className="text-gainsboro-400 text-sm">Loading...</span>
          </div>
        </div>
      }>
        <Routes>
          {/* Public routes: any user can access the login and signup pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          {/* Protected route group: everything under "/" requires authentication to access */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                {/* Layout component wraps all authenticated pages (likely contains navbar/sidebar) */}
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
