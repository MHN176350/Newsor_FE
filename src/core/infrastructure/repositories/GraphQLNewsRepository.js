import { INewsRepository } from '../../domain/repositories/INewsRepository.js';
import { News } from '../../domain/entities/News.js';
import { User } from '../../domain/entities/User.js';
import { Category, Tag } from '../../domain/entities/Content.js';
import {
  GET_NEWS_LIST,
  GET_PUBLISHED_NEWS,
  GET_NEWS_ARTICLE,
  CREATE_NEWS
} from '../api/newsQueries.js';

/**
 * GraphQL implementation of INewsRepository
 */
export class GraphQLNewsRepository extends INewsRepository {
  constructor(apolloClient) {
    super();
    this.client = apolloClient;
  }

  async getNewsById(id) {
    try {
      const { data } = await this.client.query({
        query: GET_NEWS_ARTICLE,
        variables: { id },
        fetchPolicy: 'cache-first'
      });

      if (!data.newsArticle) {
        return null;
      }

      return this._mapNewsFromGraphQL(data.newsArticle);
    } catch (error) {
      console.error('Error getting news by ID:', error);
      throw new Error(error.message || 'Failed to get news article');
    }
  }

  async getNewsBySlug(slug) {
    try {
      const { data } = await this.client.query({
        query: GET_NEWS_ARTICLE,
        variables: { slug },
        fetchPolicy: 'cache-first'
      });

      if (!data.newsArticle) {
        return null;
      }

      return this._mapNewsFromGraphQL(data.newsArticle);
    } catch (error) {
      console.error('Error getting news by slug:', error);
      throw new Error(error.message || 'Failed to get news article');
    }
  }

  async getNewsList(filters = {}) {
    try {
      const { data } = await this.client.query({
        query: GET_NEWS_LIST,
        variables: filters,
        fetchPolicy: 'cache-first'
      });

      return data.newsList.map(news => this._mapNewsFromGraphQL(news));
    } catch (error) {
      console.error('Error getting news list:', error);
      throw new Error(error.message || 'Failed to get news list');
    }
  }

  async getPublishedNews(filters = {}) {
    try {
      const { data } = await this.client.query({
        query: GET_PUBLISHED_NEWS,
        variables: filters,
        fetchPolicy: 'cache-first'
      });

      return data.publishedNews.map(news => this._mapNewsFromGraphQL(news));
    } catch (error) {
      console.error('Error getting published news:', error);
      throw new Error(error.message || 'Failed to get published news');
    }
  }

  async createNews(newsData) {
    try {
      const { data } = await this.client.mutate({
        mutation: CREATE_NEWS,
        variables: newsData
      });

      if (!data.createNews.success) {
        throw new Error(data.createNews.errors?.join(', ') || 'Failed to create news article');
      }

      return this._mapNewsFromGraphQL(data.createNews.news);
    } catch (error) {
      console.error('Error creating news:', error);
      throw new Error(error.message || 'Failed to create news article');
    }
  }

  async updateNews(id, newsData) {
    // TODO: Implement update news mutation
    throw new Error('Update news not implemented yet');
  }

  async deleteNews(id) {
    // TODO: Implement delete news mutation
    throw new Error('Delete news not implemented yet');
  }

  async publishNews(id) {
    // TODO: Implement publish news mutation
    throw new Error('Publish news not implemented yet');
  }

  async unpublishNews(id) {
    // TODO: Implement unpublish news mutation
    throw new Error('Unpublish news not implemented yet');
  }

  async searchNews(query, filters = {}) {
    return await this.getPublishedNews({
      ...filters,
      search: query
    });
  }

  // Private helper methods
  _mapNewsFromGraphQL(newsData) {
    return new News({
      id: newsData.id,
      title: newsData.title,
      slug: newsData.slug,
      content: newsData.content,
      excerpt: newsData.excerpt,
      status: newsData.status,
      author: newsData.author ? this._mapAuthorFromGraphQL(newsData.author) : null,
      category: newsData.category ? this._mapCategoryFromGraphQL(newsData.category) : null,
      tags: newsData.tags ? newsData.tags.map(tag => this._mapTagFromGraphQL(tag)) : [],
      featuredImageUrl: newsData.featuredImageUrl,
      metaDescription: newsData.metaDescription,
      metaKeywords: newsData.metaKeywords,
      viewCount: newsData.viewCount,
      likeCount: newsData.likeCount,
      createdAt: newsData.createdAt,
      updatedAt: newsData.updatedAt,
      publishedAt: newsData.publishedAt
    });
  }

  _mapAuthorFromGraphQL(authorData) {
    return new User({
      id: authorData.id,
      username: authorData.username,
      firstName: authorData.firstName,
      lastName: authorData.lastName,
      profile: authorData.profile
    });
  }

  _mapCategoryFromGraphQL(categoryData) {
    return new Category({
      id: categoryData.id,
      name: categoryData.name,
      slug: categoryData.slug,
      description: categoryData.description
    });
  }

  _mapTagFromGraphQL(tagData) {
    return new Tag({
      id: tagData.id,
      name: tagData.name,
      slug: tagData.slug
    });
  }
}
