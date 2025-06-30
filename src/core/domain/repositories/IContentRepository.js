/**
 * Abstract repository interface for Category entities
 */
export class ICategoryRepository {
  async getAllCategories() {
    throw new Error('Method not implemented');
  }

  async getCategoryById(id) {
    throw new Error('Method not implemented');
  }

  async createCategory(categoryData) {
    throw new Error('Method not implemented');
  }

  async updateCategory(id, categoryData) {
    throw new Error('Method not implemented');
  }

  async deleteCategory(id) {
    throw new Error('Method not implemented');
  }
}

/**
 * Abstract repository interface for Tag entities
 */
export class ITagRepository {
  async getAllTags() {
    throw new Error('Method not implemented');
  }

  async getTagById(id) {
    throw new Error('Method not implemented');
  }

  async createTag(tagData) {
    throw new Error('Method not implemented');
  }

  async updateTag(id, tagData) {
    throw new Error('Method not implemented');
  }

  async deleteTag(id) {
    throw new Error('Method not implemented');
  }
}

/**
 * Abstract repository interface for Comment entities
 */
export class ICommentRepository {
  async getCommentsByArticle(articleId) {
    throw new Error('Method not implemented');
  }

  async createComment(commentData) {
    throw new Error('Method not implemented');
  }

  async updateComment(id, commentData) {
    throw new Error('Method not implemented');
  }

  async deleteComment(id) {
    throw new Error('Method not implemented');
  }

  async approveComment(id) {
    throw new Error('Method not implemented');
  }

  async rejectComment(id) {
    throw new Error('Method not implemented');
  }
}
