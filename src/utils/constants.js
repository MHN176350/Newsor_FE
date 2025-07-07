// User Roles
export const USER_ROLES = {
  READER: 'reader',
  WRITER: 'writer',
  MANAGER: 'manager',
  ADMIN: 'admin',
};

// News Status
export const NEWS_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending_review',
  APPROVED: 'approved',
  PUBLISHED: 'published',
  REJECTED: 'rejected',
};

// API Endpoints
export const API_ENDPOINTS = {
  GRAPHQL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/graphql/` : 'http://localhost:8000/graphql/',
  REST_BASE: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/` : 'http://localhost:8000/api/',
  WS_BASE: import.meta.env.VITE_WS_URL ? import.meta.env.VITE_WS_URL : 'ws://localhost:8000',
};

// Validation Rules
export const VALIDATION = {
  USERNAME_MIN_LENGTH: 3,
  PASSWORD_MIN_LENGTH: 8,
  TITLE_MAX_LENGTH: 200,
  EXCERPT_MAX_LENGTH: 500,
};

// Default Values
export const DEFAULTS = {
  AVATAR_PLACEHOLDER: '/static/images/default-avatar.svg',
  NEWS_IMAGE_PLACEHOLDER: '/static/images/default-news.svg',
  ITEMS_PER_PAGE: 10,
};

// Theme Colors (matching our theme)
export const THEME_COLORS = {
  PRIMARY: '#202124',
  SECONDARY: '#5f6368',
  BACKGROUND: '#ffffff',
  SURFACE: '#fafafa',
  TEXT_PRIMARY: '#202124',
  TEXT_SECONDARY: '#5f6368',
  DIVIDER: '#e8eaed',
};

// Helper Functions
export const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const generateSlug = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

export const getRoleColor = (role) => {
  switch (role) {
    case USER_ROLES.ADMIN:
      return 'danger';
    case USER_ROLES.MANAGER:
      return 'warning';
    case USER_ROLES.WRITER:
      return 'primary';
    case USER_ROLES.READER:
    default:
      return 'neutral';
  }
};

export const getStatusColor = (status) => {
  switch (status) {
    case NEWS_STATUS.PUBLISHED:
      return 'success';
    case NEWS_STATUS.APPROVED:
      return 'primary';
    case NEWS_STATUS.PENDING:
      return 'warning';
    case NEWS_STATUS.REJECTED:
      return 'danger';
    case NEWS_STATUS.DRAFT:
    default:
      return 'neutral';
  }
};

export const getStatusText = (status) => {
  switch (status) {
    case NEWS_STATUS.PUBLISHED:
      return 'Published';
    case NEWS_STATUS.APPROVED:
      return 'Approved';
    case NEWS_STATUS.PENDING:
      return 'Pending Review';
    case NEWS_STATUS.REJECTED:
      return 'Rejected';
    case NEWS_STATUS.DRAFT:
    default:
      return 'Draft';
  }
};

// Validation helpers
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateUsername = (username) => {
  return username && username.length >= VALIDATION.USERNAME_MIN_LENGTH;
};

export const validatePassword = (password) => {
  return password && password.length >= VALIDATION.PASSWORD_MIN_LENGTH;
};

// Storage helpers
export const getToken = () => {
  return localStorage.getItem('token');
};

export const setToken = (token) => {
  localStorage.setItem('token', token);
};

export const removeToken = () => {
  localStorage.removeItem('token');
};

export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

export const setRefreshToken = (refreshToken) => {
  localStorage.setItem('refreshToken', refreshToken);
};

export const removeRefreshToken = () => {
  localStorage.removeItem('refreshToken');
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
};

export const setCurrentUser = (user) => {
  localStorage.setItem('currentUser', JSON.stringify(user));
};

export const removeCurrentUser = () => {
  localStorage.removeItem('currentUser');
};

export const clearAuthData = () => {
  removeToken();
  removeRefreshToken();
  removeCurrentUser();
};

// Permission helpers
export const canEditNews = (user, news) => {
  if (!user || !news) return false;
  
  // Admins and managers can edit any news
  if (user.profile?.role === USER_ROLES.ADMIN || user.profile?.role === USER_ROLES.MANAGER) {
    return true;
  }
  
  
  if (user.profile?.role === USER_ROLES.WRITER && news.author.id === user.id) {
    return news.status !== NEWS_STATUS.PUBLISHED;
  }
  
  return false;
};

export const canDeleteNews = (user, news) => {
  if (!user || !news) return false;
  
  // Only admins can delete news
  return user.profile?.role === USER_ROLES.ADMIN;
};

export const canApproveNews = (user) => {
  if (!user) return false;
  return user.profile?.role === USER_ROLES.MANAGER || user.profile?.role === USER_ROLES.ADMIN;
};

export const canCreateNews = (user) => {
  if (!user) return false;
  const role = user.profile?.role;
  return role === USER_ROLES.WRITER || role === USER_ROLES.MANAGER || role === USER_ROLES.ADMIN;
};
