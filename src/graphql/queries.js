import { gql } from '@apollo/client';

// Authentication Queries
export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      id
      username
      email
      firstName
      lastName
      profile {
        id
        role
        bio
        avatarUrl
        phone
        dateOfBirth
        isVerified
        createdAt
        updatedAt
      }
    }
  }
`;

// User Queries
export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      username
      email
      firstName
      lastName
      isActive
      profile {
        id
        role
        bio
        avatarUrl
        phone
        dateOfBirth
        isVerified
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_USER = gql`
  query GetUser($id: Int!) {
    user(id: $id) {
      id
      username
      email
      firstName
      lastName
      isActive
      profile {
        id
        role
        bio
        avatarUrl
        phone
        dateOfBirth
        isVerified
        createdAt
        updatedAt
      }
    }
  }
`;

// News Queries
export const GET_NEWS_LIST = gql`
  query GetNewsList($status: String, $categoryId: Int, $tagId: Int, $authorId: Int, $search: String) {
    newsList(status: $status, categoryId: $categoryId, tagId: $tagId, authorId: $authorId, search: $search) {
      id
      title
      content
      excerpt
      featuredImageUrl
      status
      publishedAt
      createdAt
      updatedAt
      slug
      author {
        id
        username
        firstName
        lastName
      }
      category {
        id
        name
        slug
      }
      tags {
        id
        name
        slug
      }
    }
  }
`;

export const GET_PUBLISHED_NEWS = gql`
  query GetPublishedNews($search: String, $categoryId: Int, $tagId: Int) {
    publishedNews(search: $search, categoryId: $categoryId, tagId: $tagId) {
      id
      title
      content
      excerpt
      featuredImageUrl
      publishedAt
      createdAt
      slug
      author {
        id
        username
        firstName
        lastName
      }
      category {
        id
        name
        slug
      }
      tags {
        id
        name
        slug
      }
    }
  }
`;

export const GET_NEWS = gql`
  query GetNews($id: Int, $slug: String) {
    newsArticle(id: $id, slug: $slug) {
      id
      title
      content
      excerpt
      featuredImageUrl
      status
      publishedAt
      createdAt
      updatedAt
      slug
      author {
        id
        username
        firstName
        lastName
      }
      category {
        id
        name
        slug
      }
      tags {
        id
        name
        slug
      }
    }
  }
`;

export const GET_MY_NEWS = gql`
  query GetMyNews {
    newsList(authorId: null) {
      id
      title
      content
      excerpt
      featuredImageUrl
      status
      publishedAt
      createdAt
      updatedAt
      slug
      category {
        id
        name
        slug
      }
      tags {
        id
        name
        slug
      }
    }
  }
`;

// Category Queries
export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      slug
      description
    }
  }
`;

export const GET_CATEGORY = gql`
  query GetCategory($id: Int!) {
    category(id: $id) {
      id
      name
      slug
      description
    }
  }
`;

// Tag Queries
export const GET_TAGS = gql`
  query GetTags {
    tags {
      id
      name
      slug
    }
  }
`;

export const GET_TAG = gql`
  query GetTag($id: Int!) {
    tag(id: $id) {
      id
      name
      slug
    }
  }
`;

// Comment Queries
export const GET_COMMENTS = gql`
  query GetComments($articleId: Int!) {
    articleComments(articleId: $articleId) {
      id
      content
      createdAt
      updatedAt
      author {
        id
        username
        firstName
        lastName
      }
    }
  }
`;

// Analytics Queries
export const GET_READING_HISTORY = gql`
  query GetReadingHistory($userId: Int!) {
    userReadingHistory(userId: $userId) {
      id
      readAt
      news {
        id
        title
        excerpt
        featuredImageUrl
        author {
          id
          username
          firstName
          lastName
        }
      }
    }
  }
`;

// Analytics Queries - These would need to be implemented in the backend
/*
export const GET_NEWS_ANALYTICS = gql`
  query GetNewsAnalytics($newsId: Int!) {
    newsAnalytics(newsId: $newsId) {
      totalReads
      totalLikes
      totalComments
      dailyReads {
        date
        count
      }
      popularityScore
    }
  }
`;
*/

// Dashboard Queries
export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    dashboardStats {
      totalUsers
      totalReaders
      totalWriters
      totalManagers
      totalAdmins
      newUsersThisMonth
      totalNews
      publishedNews
      draftNews
      pendingNews
      rejectedNews
      newsThisMonth
      totalCategories
      totalTags
      totalViews
      totalLikes
      totalComments
    }
  }
`;

export const GET_RECENT_ACTIVITY = gql`
  query GetRecentActivity($limit: Int) {
    recentActivity(limit: $limit) {
      id
      action
      description
      timestamp
      user {
        id
        username
        firstName
        lastName
      }
    }
  }
`;
