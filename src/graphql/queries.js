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
  query GetNewsList($status: String, $categoryId: Int, $tagId: Int, $authorId: Int) {
    newsList(status: $status, categoryId: $categoryId, tagId: $tagId, authorId: $authorId) {
      id
      title
      content
      excerpt
      featuredImage
      status
      isPublished
      publishedAt
      createdAt
      updatedAt
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
      likesCount
      commentsCount
      readCount
    }
  }
`;

export const GET_PUBLISHED_NEWS = gql`
  query GetPublishedNews($categoryId: Int, $tagId: Int) {
    publishedNews(categoryId: $categoryId, tagId: $tagId) {
      id
      title
      content
      excerpt
      featuredImage
      publishedAt
      createdAt
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
      likesCount
      commentsCount
      readCount
    }
  }
`;

export const GET_NEWS = gql`
  query GetNews($id: Int!) {
    news(id: $id) {
      id
      title
      content
      excerpt
      featuredImage
      status
      isPublished
      publishedAt
      createdAt
      updatedAt
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
      likesCount
      commentsCount
      readCount
      isLikedByUser
      comments {
        id
        content
        createdAt
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

export const GET_MY_NEWS = gql`
  query GetMyNews {
    myNews {
      id
      title
      content
      excerpt
      featuredImage
      status
      isPublished
      publishedAt
      createdAt
      updatedAt
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
      likesCount
      commentsCount
      readCount
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
      newsCount
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
      newsCount
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
      newsCount
    }
  }
`;

export const GET_TAG = gql`
  query GetTag($id: Int!) {
    tag(id: $id) {
      id
      name
      slug
      newsCount
    }
  }
`;

// Comment Queries
export const GET_COMMENTS = gql`
  query GetComments($newsId: Int!) {
    comments(newsId: $newsId) {
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
  query GetReadingHistory {
    readingHistory {
      id
      readAt
      news {
        id
        title
        excerpt
        featuredImage
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

// Dashboard Queries
export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    dashboardStats {
      totalNews
      totalPublished
      totalDrafts
      totalPending
      totalRejected
      totalUsers
      totalReaders
      totalWriters
      totalManagers
      totalAdmins
      recentActivity {
        id
        action
        description
        timestamp
        user {
          id
          username
        }
      }
    }
  }
`;
