import { useState, useEffect, useCallback } from 'react';
import { getContainer } from '../../container.js';

/**
 * Hook for managing news articles
 */
export const useNews = () => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const container = getContainer();
  const getPublishedNewsUseCase = container.getPublishedNewsUseCase;
  const createNewsUseCase = container.createNewsUseCase;
  const searchNewsUseCase = container.searchNewsUseCase;

  const loadNews = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const news = await getPublishedNewsUseCase.execute(filters);
      setNewsList(news);
    } catch (err) {
      setError(err.message);
      setNewsList([]);
    } finally {
      setLoading(false);
    }
  }, [getPublishedNewsUseCase]);

  const searchNews = useCallback(async (query, filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const news = await searchNewsUseCase.execute(query, filters);
      setNewsList(news);
    } catch (err) {
      setError(err.message);
      setNewsList([]);
    } finally {
      setLoading(false);
    }
  }, [searchNewsUseCase]);

  const createNews = async (newsData) => {
    try {
      setLoading(true);
      setError(null);
      const newArticle = await createNewsUseCase.execute(newsData);
      
      // Add to news list if it matches current filters
      setNewsList(prevList => [newArticle, ...prevList]);
      
      return { success: true, article: newArticle };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    newsList,
    loading,
    error,
    loadNews,
    searchNews,
    createNews,
    refreshNews: loadNews
  };
};

/**
 * Hook for managing a single news article
 */
export const useNewsArticle = (articleId, slug) => {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const container = getContainer();
  const newsRepository = container.newsRepository;

  useEffect(() => {
    if (articleId || slug) {
      loadArticle();
    }
  }, [articleId, slug]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let articleData;
      if (articleId) {
        articleData = await newsRepository.getNewsById(articleId);
      } else if (slug) {
        articleData = await newsRepository.getNewsBySlug(slug);
      }
      
      setArticle(articleData);
    } catch (err) {
      setError(err.message);
      setArticle(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    article,
    loading,
    error,
    refreshArticle: loadArticle
  };
};
