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
import ReviewArticlesPage from './pages/ReviewArticlesPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ImageUploadTestPage from './pages/ImageUploadTestPage';
import CommentHistoryPage from './pages/CommentHistoryPage';
import ReadingHistoryPage from './pages/ReadingHistoryPage';

// Initialize the Clean Architecture container
initializeContainer(apolloClient);
 

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <ThemeProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* News/Articles Public Routes */}
              <Route path="/news" element={<NewsPage />} />
              <Route path="/news/:slug" element={<NewsDetailPage />} />
              
              {/* Writer/Author Routes */}
              <Route path="/my-articles" element={<MyArticlesPage />} />
              <Route path="/articles/create" element={<CreateArticlePage />} />
              <Route path="/articles/edit/:id" element={<CreateArticlePage />} />
              <Route path="/articles/duplicate/:id" element={<CreateArticlePage />} />
              <Route path="/writer/articles/:id" element={<WriterNewsDetailPage />} />
              
              {/* Editor/Manager Routes */}
              <Route path="/review" element={<ReviewArticlesPage />} />
              <Route path="/review/articles" element={<ReviewArticlesPage />} />
              <Route path="/review/article/:slug" element={<ReviewNewsPage />} />
              
              {/* User Profile & Dashboard */}
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/comment-history" element={<CommentHistoryPage />} />
              <Route path="/reading-history" element={<ReadingHistoryPage />} />
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              
              {/* Development/Testing Routes */}
              <Route path="/test/image-upload" element={<ImageUploadTestPage />} />
            </Routes>
          </Layout>
        </Router>
        <Toaster position="top-right" />
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default App;
