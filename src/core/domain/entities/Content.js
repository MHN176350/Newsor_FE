/**
 * Category domain entity
 */
export class Category {
  constructor({
    id,
    name,
    slug,
    description,
    isActive,
    createdAt,
    updatedAt
  }) {
    this.id = id;
    this.name = name;
    this.slug = slug;
    this.description = description;
    this.isActive = isActive;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  get displayName() {
    return this.name;
  }
}

/**
 * Tag domain entity
 */
export class Tag {
  constructor({
    id,
    name,
    slug,
    createdAt,
    updatedAt
  }) {
    this.id = id;
    this.name = name;
    this.slug = slug;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  get displayName() {
    return this.name;
  }
}

/**
 * Comment domain entity
 */
export class Comment {
  constructor({
    id,
    content,
    author,
    article,
    parent,
    status,
    createdAt,
    updatedAt,
    replies
  }) {
    this.id = id;
    this.content = content;
    this.author = author;
    this.article = article;
    this.parent = parent;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.replies = replies || [];
  }

  get isApproved() {
    return this.status === 'approved';
  }

  get authorName() {
    return this.author?.fullName || this.author?.username || 'Anonymous';
  }

  get formattedDate() {
    return this.createdAt ? new Date(this.createdAt).toLocaleDateString() : '';
  }

  get hasReplies() {
    return this.replies.length > 0;
  }
}

/**
 * ArticleImage domain entity
 */
export class ArticleImage {
  constructor({
    id,
    articleId,
    imageUrl,
    caption,
    altText,
    order,
    createdAt
  }) {
    this.id = id;
    this.articleId = articleId;
    this.imageUrl = imageUrl;
    this.caption = caption;
    this.altText = altText;
    this.order = order;
    this.createdAt = createdAt;
  }
}
