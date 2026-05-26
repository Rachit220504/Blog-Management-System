import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Components & Layouts
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PostList from './pages/PostList';
import PostForm from './pages/PostForm';
import UserList from './pages/UserList';
import SeoEditor from './pages/SeoEditor';
import Categories from './pages/Categories';
import Tags from './pages/Tags';
import MediaLibrary from './pages/MediaLibrary';
import Settings from './pages/Settings';
import Unauthorized from './pages/Unauthorized';

// Create TanStack Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#0f172a',
              color: '#e2e8f0',
              border: '1px solid rgba(255,255,255,0.08)',
            },
          }}
        />
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="posts" element={<ProtectedRoute requiredPermission="posts:read"><PostList /></ProtectedRoute>} />
              <Route path="posts/new" element={<ProtectedRoute requiredPermission="posts:create"><PostForm /></ProtectedRoute>} />
              <Route path="posts/:id/edit" element={<ProtectedRoute requiredPermission="posts:update"><PostForm /></ProtectedRoute>} />
              <Route path="seo" element={<ProtectedRoute requiredPermission="seo:edit"><SeoEditor /></ProtectedRoute>} />
              <Route path="users" element={<ProtectedRoute requiredPermission="users:read"><UserList /></ProtectedRoute>} />
              <Route path="categories" element={<ProtectedRoute requiredPermission="taxonomy:read"><Categories /></ProtectedRoute>} />
              <Route path="tags" element={<ProtectedRoute requiredPermission="taxonomy:read"><Tags /></ProtectedRoute>} />
              <Route path="media" element={<ProtectedRoute requiredPermission="media:read"><MediaLibrary /></ProtectedRoute>} />
              <Route path="settings" element={<ProtectedRoute requiredPermission="settings:view"><Settings /></ProtectedRoute>} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
