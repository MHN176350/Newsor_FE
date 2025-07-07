/**
 * Validation service for form validation and data validation
 */
export class ValidationService {
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password) {
    const errors = [];
    
    if (!password) {
      errors.push('Password is required');
    } else {
      if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
      }
      if (!/(?=.*[a-z])/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
      }
      if (!/(?=.*[A-Z])/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
      }
      if (!/(?=.*\d)/.test(password)) {
        errors.push('Password must contain at least one number');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateUsername(username) {
    const errors = [];
    
    if (!username) {
      errors.push('Username is required');
    } else {
      if (username.length < 3) {
        errors.push('Username must be at least 3 characters long');
      }
      if (username.length > 150) {
        errors.push('Username must be less than 150 characters');
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        errors.push('Username can only contain letters, numbers, and underscores');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateNewsArticle(articleData) {
    const errors = [];
    
    if (!articleData.title?.trim()) {
      errors.push('Title is required');
    } else if (articleData.title.length > 200) {
      errors.push('Title must be less than 200 characters');
    }
    
    if (!articleData.content?.trim()) {
      errors.push('Content is required');
    } else if (articleData.content.length < 50) {
      errors.push('Content must be at least 50 characters long');
    }
    
    if (!articleData.excerpt?.trim()) {
      errors.push('Excerpt is required');
    } else if (articleData.excerpt.length > 500) {
      errors.push('Excerpt must be less than 500 characters');
    }
    
    if (!articleData.categoryId) {
      errors.push('Category is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static sanitizeHtml(html) {
    // Basic HTML sanitization - in a real app, use a library like DOMPurify
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }
}

/**
 * Format service for data formatting
 */
export class FormatService {
  static formatDate(date, options = {}) {
    if (!date) return '';
    
    const dateObj = new Date(date);
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    
    return dateObj.toLocaleDateString('en-US', { ...defaultOptions, ...options });
  }

  static formatDateTime(date) {
    if (!date) return '';
    
    const dateObj = new Date(date);
    return dateObj.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  static formatRelativeTime(date) {
    if (!date) return '';
    
    const now = new Date();
    const dateObj = new Date(date);
    const diffInMinutes = Math.floor((now - dateObj) / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    }
    
    return this.formatDate(date);
  }

  static formatNumber(number) {
    if (number === null || number === undefined) return '0';
    return new Intl.NumberFormat().format(number);
  }

  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static slugify(text) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  static truncateText(text, maxLength = 100) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }
}
