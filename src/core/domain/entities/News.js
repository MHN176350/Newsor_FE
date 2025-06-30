/**
 * News article domain entity
 */
export class News {
  constructor({
    id,
    title,
    slug,
    content,
    excerpt,
    status,
    author,
    category,
    tags,
    featuredImageUrl,
    metaDescription,
    metaKeywords,
    viewCount,
    likeCount,
    createdAt,
    updatedAt,
    publishedAt,
    images
  }) {
    this.id = id;
    this.title = title;
    this.slug = slug;
    this.content = content;
    this.excerpt = excerpt;
    this.status = status;
    this.author = author;
    this.category = category;
    this.tags = tags || [];
    this.featuredImageUrl = featuredImageUrl;
    this.metaDescription = metaDescription;
    this.metaKeywords = metaKeywords;
    this.viewCount = viewCount || 0;
    this.likeCount = likeCount || 0;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.publishedAt = publishedAt;
    this.images = images || [];
  }

  get isPublished() {
    return this.status === NewsStatus.PUBLISHED;
  }

  get isDraft() {
    return this.status === NewsStatus.DRAFT;
  }

  get isPending() {
    return this.status === NewsStatus.PENDING;
  }

  get isRejected() {
    return this.status === NewsStatus.REJECTED;
  }

  get readTime() {
    const wordsPerMinute = 200;
    const wordCount = this.content?.split(/\s+/).length || 0;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  get tagNames() {
    return this.tags.map(tag => tag.name);
  }

  get authorName() {
    return this.author?.fullName || this.author?.username || 'Unknown';
  }

  get categoryName() {
    return this.category?.name || 'Uncategorized';
  }

  get formattedDate() {
    const date = this.publishedAt || this.createdAt;
    return date ? new Date(date).toLocaleDateString() : '';
  }
}

/**
 * News status enum
 */
export const NewsStatus = {
  DRAFT: 'draft',
  PENDING: 'pending',
  PUBLISHED: 'published',
  REJECTED: 'rejected'
};
