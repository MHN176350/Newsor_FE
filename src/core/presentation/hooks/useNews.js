import { useState, useEffect, useCallback, useRef } from 'react';
import { getContainer } from '../../container.js';

/**
 * Hook for managing news articles
 */
export const useNews = () => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Use refs to store stable references to services
  const containerRef = useRef(null);
  const getPublishedNewsUseCaseRef = useRef(null);
  const createNewsUseCaseRef = useRef(null);
  const searchNewsUseCaseRef = useRef(null);

  // Initialize services once
  if (!containerRef.current) {
    containerRef.current = getContainer();
    getPublishedNewsUseCaseRef.current = containerRef.current.getPublishedNewsUseCase;
    createNewsUseCaseRef.current = containerRef.current.createNewsUseCase;
    searchNewsUseCaseRef.current = containerRef.current.searchNewsUseCase;
  }

  const loadNews = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const news = await getPublishedNewsUseCaseRef.current.execute(filters);
      setNewsList(news);
    } catch (err) {
      setError(err.message);
      setNewsList([]);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since we're using refs

  const searchNews = useCallback(async (query, filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const news = await searchNewsUseCaseRef.current.execute(query, filters);
      setNewsList(news);
    } catch (err) {
      setError(err.message);
      setNewsList([]);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since we're using refs

  const createNews = async (newsData) => {
    try {
      setLoading(true);
      setError(null);
      const newArticle = await createNewsUseCaseRef.current.execute(newsData);
      
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
