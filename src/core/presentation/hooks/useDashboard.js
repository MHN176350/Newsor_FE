import { useState, useEffect } from 'react';
import { getContainer } from '../../container.js';

/**
 * Hook for managing dashboard statistics
 */
export const useDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const container = getContainer();
  const getDashboardStatsUseCase = container.getDashboardStatsUseCase;
  const getRecentActivityUseCase = container.getRecentActivityUseCase;

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load stats and recent activity in parallel
      const [statsResult, activityResult] = await Promise.allSettled([
        getDashboardStatsUseCase.execute(),
        getRecentActivityUseCase.execute(10)
      ]);

      if (statsResult.status === 'fulfilled') {
        setStats(statsResult.value);
      } else {
        console.error('Failed to load dashboard stats:', statsResult.reason);
      }

      if (activityResult.status === 'fulfilled') {
        setRecentActivity(activityResult.value);
      } else {
        console.error('Failed to load recent activity:', activityResult.reason);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    recentActivity,
    loading,
    error,
    refreshDashboard: loadDashboardData
  };
};

/**
 * Hook for managing categories and tags
 */
export const useContent = () => {
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const container = getContainer();
  
  // For now, we'll use the repositories directly
  // In a complete implementation, these would also have use cases
  const categoryRepository = container.newsRepository; // Would be separate in real app
  const tagRepository = container.newsRepository; // Would be separate in real app

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      // This would be implemented in the repository
      // const categories = await categoryRepository.getAllCategories();
      // setCategories(categories);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      setLoading(true);
      setError(null);
      // This would be implemented in the repository
      // const tags = await tagRepository.getAllTags();
      // setTags(tags);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    tags,
    loading,
    error,
    loadCategories,
    loadTags
  };
};
