/**
 * Create category request DTO
 */
export class CreateCategoryRequestDto {
  constructor(name, slug, description) {
    this.name = name;
    this.slug = slug;
    this.description = description;
  }
}

/**
 * Create tag request DTO
 */
export class CreateTagRequestDto {
  constructor(name, slug) {
    this.name = name;
    this.slug = slug;
  }
}

/**
 * Create comment request DTO
 */
export class CreateCommentRequestDto {
  constructor(articleId, content, parentId) {
    this.articleId = articleId;
    this.content = content;
    this.parentId = parentId;
  }
}
