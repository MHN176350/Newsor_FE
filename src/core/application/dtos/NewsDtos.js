/**
 * Create news request DTO
 */
export class CreateNewsRequestDto {
  constructor({
    title,
    content,
    excerpt,
    categoryId,
    tagIds,
    featuredImage,
    metaDescription,
    metaKeywords
  }) {
    this.title = title;
    this.content = content;
    this.excerpt = excerpt;
    this.categoryId = categoryId;
    this.tagIds = tagIds || [];
    this.featuredImage = featuredImage;
    this.metaDescription = metaDescription;
    this.metaKeywords = metaKeywords;
  }
}

/**
 * Update news request DTO
 */
export class UpdateNewsRequestDto {
  constructor({
    title,
    content,
    excerpt,
    categoryId,
    tagIds,
    featuredImage,
    metaDescription,
    metaKeywords,
    status
  }) {
    this.title = title;
    this.content = content;
    this.excerpt = excerpt;
    this.categoryId = categoryId;
    this.tagIds = tagIds;
    this.featuredImage = featuredImage;
    this.metaDescription = metaDescription;
    this.metaKeywords = metaKeywords;
    this.status = status;
  }
}

/**
 * News filter DTO
 */
export class NewsFilterDto {
  constructor({
    status,
    categoryId,
    authorId,
    search,
    tagId,
    limit,
    offset
  } = {}) {
    this.status = status;
    this.categoryId = categoryId;
    this.authorId = authorId;
    this.search = search;
    this.tagId = tagId;
    this.limit = limit;
    this.offset = offset;
  }
}
