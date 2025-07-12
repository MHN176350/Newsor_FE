// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  WRITER: 'writer',
  READER: 'reader'
};

// Status constants
export const NEWS_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
};

// Get color for user role
export const getRoleColor = (role) => {
  switch (role?.toLowerCase()) {
    case USER_ROLES.ADMIN:
      return 'red';
    case USER_ROLES.MANAGER:
      return 'orange';
    case USER_ROLES.WRITER:
      return 'green';
    case USER_ROLES.READER:
      return 'blue';
    default:
      return 'default';
  }
};

// Get color for news status
export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case NEWS_STATUS.PUBLISHED:
      return 'green';
    case NEWS_STATUS.PENDING:
      return 'orange';
    case NEWS_STATUS.DRAFT:
      return 'default';
    case NEWS_STATUS.ARCHIVED:
      return 'red';
    default:
      return 'default';
  }
};

// Format date utility
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format number utility
export const formatNumber = (num) => {
  if (!num) return '0';
  return num.toLocaleString();
};

// Truncate text utility
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Service choices 
export const SERVICE_CHOICES = {
  CONSULTING: 'consulting',
  DEVELOPMENT: 'development',
  MARKETING: 'marketing',
  SUPPORT: 'support'
};