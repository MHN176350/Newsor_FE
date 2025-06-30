/**
 * Use case for creating a news article
 */
export class CreateNewsUseCase {
  constructor(newsRepository, authService) {
    this.newsRepository = newsRepository;
    this.authService = authService;
  }

  async execute(newsData) {
    // Validate user permissions
    const currentUser = await this.authService.getCurrentUser();
    if (!currentUser || !currentUser.profile?.hasWritePermission) {
      throw new Error('Permission denied. Writer role required.');
    }

    // Validate required fields
    if (!newsData.title?.trim()) {
      throw new Error('Title is required');
    }
    if (!newsData.content?.trim()) {
      throw new Error('Content is required');
    }
    if (!newsData.excerpt?.trim()) {
      throw new Error('Excerpt is required');
    }
    if (!newsData.categoryId) {
      throw new Error('Category is required');
    }

    // Create the news article
    return await this.newsRepository.createNews({
      ...newsData,
      status: 'draft' // Default to draft
    });
  }
}

/**
 * Use case for updating a news article
 */
export class UpdateNewsUseCase {
  constructor(newsRepository, authService) {
    this.newsRepository = newsRepository;
    this.authService = authService;
  }

  async execute(newsId, updateData) {
    // Validate user permissions
    const currentUser = await this.authService.getCurrentUser();
    if (!currentUser || !currentUser.profile?.hasWritePermission) {
      throw new Error('Permission denied. Writer role required.');
    }

    // Get existing news article
    const existingNews = await this.newsRepository.getNewsById(newsId);
    if (!existingNews) {
      throw new Error('News article not found');
    }

    // Check if user can edit this article
    const canEdit = currentUser.profile.hasAdminPermission || 
                   currentUser.profile.hasManagerPermission ||
                   existingNews.author.id === currentUser.id;
    
    if (!canEdit) {
      throw new Error('Permission denied. You can only edit your own articles.');
    }

    return await this.newsRepository.updateNews(newsId, updateData);
  }
}

/**
 * Use case for publishing a news article
 */
export class PublishNewsUseCase {
  constructor(newsRepository, authService) {
    this.newsRepository = newsRepository;
    this.authService = authService;
  }

  async execute(newsId) {
    const currentUser = await this.authService.getCurrentUser();
    if (!currentUser || !currentUser.profile?.hasManagerPermission) {
      throw new Error('Permission denied. Manager role required.');
    }

    return await this.newsRepository.publishNews(newsId);
  }
}

/**
 * Use case for getting published news with filters
 */
export class GetPublishedNewsUseCase {
  constructor(newsRepository) {
    this.newsRepository = newsRepository;
  }

  async execute(filters = {}) {
    return await this.newsRepository.getPublishedNews(filters);
  }
}

/**
 * Use case for searching news
 */
export class SearchNewsUseCase {
  constructor(newsRepository) {
    this.newsRepository = newsRepository;
  }

  async execute(query, filters = {}) {
    if (!query?.trim()) {
      return [];
    }

    return await this.newsRepository.searchNews(query, filters);
  }
}
