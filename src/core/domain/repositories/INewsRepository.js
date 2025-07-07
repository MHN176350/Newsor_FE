/**
 * Abstract repository interface for News entities
 */
export class INewsRepository {
  async getNewsById(id) {
    throw new Error('Method not implemented');
  }

  async getNewsBySlug(slug) {
    throw new Error('Method not implemented');
  }

  async getNewsList(filters = {}) {
    throw new Error('Method not implemented');
  }

  async getPublishedNews(filters = {}) {
    throw new Error('Method not implemented');
  }

  async createNews(newsData) {
    throw new Error('Method not implemented');
  }

  async updateNews(id, newsData) {
    throw new Error('Method not implemented');
  }

  async deleteNews(id) {
    throw new Error('Method not implemented');
  }

  async publishNews(id) {
    throw new Error('Method not implemented');
  }

  async unpublishNews(id) {
    throw new Error('Method not implemented');
  }

  async searchNews(query, filters = {}) {
    throw new Error('Method not implemented');
  }
}
