/**
 * Dashboard statistics domain entity
 */
export class DashboardStats {
  constructor({
    // User statistics
    totalUsers,
    totalReaders,
    totalWriters,
    totalManagers,
    totalAdmins,
    newUsersThisMonth,
    
    // News statistics
    totalNews,
    publishedNews,
    draftNews,
    pendingNews,
    rejectedNews,
    newsThisMonth,
    
    // Category and Tag statistics
    totalCategories,
    totalTags,
    
    // Activity statistics
    totalViews,
    totalLikes,
    totalComments
  }) {
    this.totalUsers = totalUsers || 0;
    this.totalReaders = totalReaders || 0;
    this.totalWriters = totalWriters || 0;
    this.totalManagers = totalManagers || 0;
    this.totalAdmins = totalAdmins || 0;
    this.newUsersThisMonth = newUsersThisMonth || 0;
    
    this.totalNews = totalNews || 0;
    this.publishedNews = publishedNews || 0;
    this.draftNews = draftNews || 0;
    this.pendingNews = pendingNews || 0;
    this.rejectedNews = rejectedNews || 0;
    this.newsThisMonth = newsThisMonth || 0;
    
    this.totalCategories = totalCategories || 0;
    this.totalTags = totalTags || 0;
    
    this.totalViews = totalViews || 0;
    this.totalLikes = totalLikes || 0;
    this.totalComments = totalComments || 0;
  }

  get publishedPercentage() {
    return this.totalNews > 0 ? Math.round((this.publishedNews / this.totalNews) * 100) : 0;
  }

  get draftPercentage() {
    return this.totalNews > 0 ? Math.round((this.draftNews / this.totalNews) * 100) : 0;
  }

  get pendingPercentage() {
    return this.totalNews > 0 ? Math.round((this.pendingNews / this.totalNews) * 100) : 0;
  }

  get averageViewsPerArticle() {
    return this.publishedNews > 0 ? Math.round(this.totalViews / this.publishedNews) : 0;
  }

  get averageLikesPerArticle() {
    return this.publishedNews > 0 ? Math.round(this.totalLikes / this.publishedNews) : 0;
  }
}

/**
 * Recent activity domain entity
 */
export class RecentActivity {
  constructor({
    id,
    action,
    description,
    timestamp,
    user
  }) {
    this.id = id;
    this.action = action;
    this.description = description;
    this.timestamp = timestamp;
    this.user = user;
  }

  get formattedTime() {
    if (!this.timestamp) return '';
    
    const now = new Date();
    const activityTime = new Date(this.timestamp);
    const diffInMinutes = Math.floor((now - activityTime) / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return activityTime.toLocaleDateString();
  }

  get userName() {
    return this.user?.fullName || this.user?.username || 'Unknown';
  }
}
