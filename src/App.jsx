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
import AdminDashboardPage from './pages/AdminDashboardPage';
import CommentHistoryPage from './pages/CommentHistoryPage';
import ReadingHistoryPage from './pages/ReadingHistoryPage';
import EvolusoftHomePage from './pages/EvolusoftHomePage';
import NotFoundPage from './pages/NotFoundPage';

// Initialize the Clean Architecture container
initializeContainer(apolloClient);
 

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <ThemeProvider>
        <Router>
          <Routes>
            {/* EvoluSoft Homepage - No Layout wrapper */}
            <Route path="/evolusoft" element={<EvolusoftHomePage />} />
            <Route path="/" element={<EvolusoftHomePage />} />
            
            {/* All other routes use Layout */}
            <Route path="/login" element={<Layout><LoginPage /></Layout>} />
            <Route path="/register" element={<Layout><RegisterPage /></Layout>} />
            
            {/* News/Articles Public Routes */}
            <Route path="/news" element={<Layout><NewsPage /></Layout>} />
            <Route path="/news/:slug" element={<Layout><NewsDetailPage /></Layout>} />
            
            {/* Writer/Author Routes */}
            <Route path="/my-articles" element={<Layout><MyArticlesPage /></Layout>} />
            <Route path="/articles/create" element={<Layout><CreateArticlePage /></Layout>} />
            <Route path="/articles/edit/:id" element={<Layout><CreateArticlePage /></Layout>} />
            <Route path="/articles/duplicate/:id" element={<Layout><CreateArticlePage /></Layout>} />
            <Route path="/writer/articles/:id" element={<Layout><WriterNewsDetailPage /></Layout>} />
            
            {/* Editor/Manager Routes */}
            <Route path="/review" element={<Layout><ReviewArticlesPage /></Layout>} />
            <Route path="/review/articles" element={<Layout><ReviewArticlesPage /></Layout>} />
            <Route path="/review/article/:slug" element={<Layout><ReviewNewsPage /></Layout>} />
            
            {/* User Profile */}
            <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<Layout><AdminDashboardPage /></Layout>} />
            <Route path="/comment-history" element={<Layout><CommentHistoryPage /></Layout>} />
            <Route path="/reading-history" element={<Layout><ReadingHistoryPage /></Layout>} />
            <Route path="/admin/dashboard" element={<Layout><AdminDashboardPage /></Layout>} />
            
            {/* 404 Not Found */}
            <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
          </Routes>
        </Router>
        <Toaster position="top-right" />
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default App;
