/**
 * @fileoverview Type definitions and constants for the Newsor Admin application
 */

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  USER: 'user'
};

// Article statuses
export const ARTICLE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile'
  },
  USERS: {
    BASE: '/users',
    CREATE: '/users',
    UPDATE: '/users/:id',
    DELETE: '/users/:id'
  },
  ARTICLES: {
    BASE: '/articles',
    CREATE: '/articles',
    UPDATE: '/articles/:id',
    DELETE: '/articles/:id',
    PUBLISH: '/articles/:id/publish'
  },
  CATEGORIES: {
    BASE: '/categories',
    CREATE: '/categories',
    UPDATE: '/categories/:id',
    DELETE: '/categories/:id'
  },
  TAGS: {
    BASE: '/tags',
    CREATE: '/tags',
    UPDATE: '/tags/:id',
    DELETE: '/tags/:id'
  },
  DASHBOARD: {
    STATS: '/dashboard/stats',
    ANALYTICS: '/dashboard/analytics'
  }
};

// Default pagination settings
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  TOTAL: 0
};

// Table column configurations
export const TABLE_COLUMNS = {
  USERS: [
    { key: 'username', title: 'Username', dataIndex: 'username', sorter: true },
    { key: 'email', title: 'Email', dataIndex: 'email', sorter: true },
    { key: 'role', title: 'Role', dataIndex: 'role', sorter: true },
    { key: 'isActive', title: 'Status', dataIndex: 'isActive', sorter: true },
    { key: 'createdAt', title: 'Created', dataIndex: 'createdAt', sorter: true },
    { key: 'actions', title: 'Actions', dataIndex: 'actions', width: 150 }
  ],
  ARTICLES: [
    { key: 'title', title: 'Title', dataIndex: 'title', sorter: true },
    { key: 'author', title: 'Author', dataIndex: 'author', sorter: true },
    { key: 'category', title: 'Category', dataIndex: 'category', sorter: true },
    { key: 'status', title: 'Status', dataIndex: 'status', sorter: true },
    { key: 'publishedAt', title: 'Published', dataIndex: 'publishedAt', sorter: true },
    { key: 'actions', title: 'Actions', dataIndex: 'actions', width: 150 }
  ],
  CATEGORIES: [
    { key: 'name', title: 'Name', dataIndex: 'name', sorter: true },
    { key: 'slug', title: 'Slug', dataIndex: 'slug', sorter: true },
    { key: 'articlesCount', title: 'Articles', dataIndex: 'articlesCount', sorter: true },
    { key: 'createdAt', title: 'Created', dataIndex: 'createdAt', sorter: true },
    { key: 'actions', title: 'Actions', dataIndex: 'actions', width: 150 }
  ]
};

// Menu items for navigation
export const MENU_ITEMS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'DashboardOutlined',
    path: '/dashboard'
  },
  {
    key: 'articles',
    label: 'Articles',
    icon: 'FileTextOutlined',
    path: '/articles'
  },
  {
    key: 'categories',
    label: 'Categories',
    icon: 'TagsOutlined',
    path: '/categories'
  },
  {
    key: 'tags',
    label: 'Tags',
    icon: 'TagOutlined',
    path: '/tags'
  },
  {
    key: 'users',
    label: 'Users',
    icon: 'UserOutlined',
    path: '/users'
  },
  {
    key: 'media',
    label: 'Media',
    icon: 'PictureOutlined',
    path: '/media'
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: 'SettingOutlined',
    path: '/settings'
  }
];

// Theme colors
export const THEME_COLORS = {
  PRIMARY: '#1890ff',
  SUCCESS: '#52c41a',
  WARNING: '#faad14',
  ERROR: '#f5222d',
  GRAY: '#f0f0f0'
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'newsor_admin_token',
  USER: 'newsor_admin_user',
  THEME: 'newsor_admin_theme'
};

// Form validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL: 'Please enter a valid email address',
  MIN_LENGTH: (min) => `Minimum length is ${min} characters`,
  MAX_LENGTH: (max) => `Maximum length is ${max} characters`,
  PASSWORDS_MATCH: 'Passwords do not match'
};

/**
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} username - Username
 * @property {string} email - Email address
 * @property {string} firstName - First name
 * @property {string} lastName - Last name
 * @property {string} role - User role (admin, editor, user)
 * @property {boolean} isActive - Active status
 * @property {string} createdAt - Creation date
 * @property {string} updatedAt - Last update date
 * @property {string} [lastLogin] - Last login date
 */

/**
 * @typedef {Object} Article
 * @property {string} id - Article ID
 * @property {string} title - Article title
 * @property {string} content - Article content
 * @property {string} excerpt - Article excerpt
 * @property {string} slug - Article slug
 * @property {string} status - Article status (draft, published, archived)
 * @property {boolean} featured - Featured status
 * @property {User} author - Article author
 * @property {Category} category - Article category
 * @property {Tag[]} tags - Article tags
 * @property {string} [publishedAt] - Published date
 * @property {string} createdAt - Creation date
 * @property {string} updatedAt - Last update date
 * @property {number} views - View count
 * @property {string} [featuredImage] - Featured image URL
 */

/**
 * @typedef {Object} Category
 * @property {string} id - Category ID
 * @property {string} name - Category name
 * @property {string} slug - Category slug
 * @property {string} description - Category description
 * @property {string} color - Category color
 * @property {number} articlesCount - Number of articles
 * @property {string} createdAt - Creation date
 * @property {string} updatedAt - Last update date
 */

/**
 * @typedef {Object} Tag
 * @property {string} id - Tag ID
 * @property {string} name - Tag name
 * @property {string} slug - Tag slug
 * @property {string} color - Tag color
 * @property {number} articlesCount - Number of articles
 * @property {string} createdAt - Creation date
 * @property {string} updatedAt - Last update date
 */
