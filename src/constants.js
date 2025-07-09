// Theme and constant values for the admin application

export const THEME_COLORS = {
  primary: '#3A9285',
  primaryHover: '#308fb3',
  secondary: '#d4e8f7',
  surface: '#ffffff',
  background: '#f8fafc',
  textPrimary: '#32353a',
  textSecondary: '#6b7280',
  accent: '#3A9285',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#1890ff',
  border: '#e5e7eb',
};

export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  WRITER: 'writer',
  READER: 'reader',
};

export const ARTICLE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
};

export const API_ENDPOINTS = {
  GRAPHQL: process.env.REACT_APP_GRAPHQL_URL || 'http://localhost:8000/graphql/',
  MEDIA: process.env.REACT_APP_MEDIA_URL || 'http://localhost:8000/media/',
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  DEFAULT_PAGE: 1,
};

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};
