import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './theme';
import apolloClient from './apollo/client';
import { initializeContainer } from './core/container.js';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';
import CreateArticlePage from './pages/CreateArticlePage';
import MyArticlesPage from './pages/MyArticlesPage';
import WriterNewsDetailPage from './pages/WriterNewsDetailPage';
import ReviewNewsPage from './pages/ReviewNewsPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

// Initialize the Clean Architecture container
initializeContainer(apolloClient);
 

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <ThemeProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/news/create" element={<CreateArticlePage />} />
              <Route path="/my-articles" element={<MyArticlesPage />} />
              <Route path="/create-article/:mode" element={<CreateArticlePage />} />
              <Route path="/create-article/:mode/:id" element={<CreateArticlePage />} />
              <Route path="/writer/article/:id" element={<WriterNewsDetailPage />} />
              <Route path="/review/:slug" element={<ReviewNewsPage />} />
              <Route path="/news/:slug" element={<NewsDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
            </Routes>
          </Layout>
        </Router>
        <Toaster position="top-right" />
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default App;
