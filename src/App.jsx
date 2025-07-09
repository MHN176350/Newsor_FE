import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { ApolloProvider } from '@apollo/client';
import { Toaster } from 'react-hot-toast';
import apolloClient from './graphql/client';
import { AuthProvider } from './store/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Articles from './pages/Articles';
import Categories from './pages/Categories';
import Tags from './pages/Tags';
import Users from './pages/Users';
import Media from './pages/Media';
import Settings from './pages/Settings';
import './i18n';
import './App.css';
import './styles/admin-theme.css';

const theme = {
  token: {
    colorPrimary: '#3A9285',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    borderRadius: 8,
    borderRadiusLG: 12,
  },
};

/**
 * Main App component with routing and theme configuration
 */
function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <ConfigProvider theme={theme}>
        <AuthProvider>
          <Router>
            <div className="App">
              <Toaster position="top-right" />
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Layout />}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="articles" element={<Articles />} />
                  <Route path="categories" element={<Categories />} />
                  <Route path="tags" element={<Tags />} />
                  <Route path="users" element={<Users />} />
                  <Route path="media" element={<Media />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </ConfigProvider>
    </ApolloProvider>
  );
}

export default App;
