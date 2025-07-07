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
      metaDescription
      metaKeywords
      likesCount
      commentsCount
      readCount
      isLikedByUser
      author {
        id
        username
        firstName
        lastName
        profile {
          avatarUrl
        }
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
    articleLikeCount(articleId: $id)
    articleComments(articleId: $id) {
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
    articleCommentCount(articleId: $id)
    articleReadCount(articleId: $id)
    isArticleLiked(articleId: $id)
  }
`;

export const GET_MY_NEWS = gql`
  query GetMyNews {
    myNews {
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

export const GET_NEWS_FOR_REVIEW = gql`
  query GetNewsForReview {
    newsForReview {
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

// Category Queries
export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      slug
      description
      createdAt
      articleCount
    }
  }
`;

export const GET_CATEGORY = gql`
  query GetCategory($id: Int) {
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
      createdAt
      isActive
      articleCount
    }
  }
`;

export const GET_ADMIN_TAGS = gql`
  query GetAdminTags {
    adminTags {
      id
      name
      slug
      createdAt
      isActive
      articleCount
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
        profile{
          avatarUrl
        }
      }
    }
  }
`;
export const GET_COMMENT_LIKE_STATUS = gql`
  query GetCommentLikeStatus($commentId: Int!) {
    commentLikeCount(commentId: $commentId)
    isCommentLiked(commentId: $commentId)
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

// Notification Queries
export const GET_NOTIFICATIONS = gql`
  query GetNotifications {
    notifications {
      id
      title
      message
      notificationType
      isRead
      readAt
      createdAt
      sender {
        id
        username
        firstName
        lastName
      }
      article {
        id
        title
        slug
      }
    }
  }
`;



// Subscriptions
export const NOTIFICATION_SUBSCRIPTION = gql`
  subscription OnNotificationAdded {
    notificationAdded {
      id
      message
      notificationType
      createdAt
      article {
        slug
      }
    }
  }
`;

// Alias for GET_NEWS for specific use case

// Notification Queries


export const GET_UNREAD_NOTIFICATIONS = gql`
  query GetUnreadNotifications {
    unreadNotifications {
      id
      title
      message
      notificationType
      isRead
      readAt
      createdAt
      sender {
        id
        username
        firstName
        lastName
      }
      article {
        id
        title
        slug
      }
    }
  }
`;

export const GET_NOTIFICATION_COUNT = gql`
  query GetNotificationCount {
    notificationCount
  }
`;

// Subscriptions


// Alias for GET_NEWS for specific use case
export const GET_NEWS_ARTICLE = GET_NEWS;

export const GET_COUNTS_AND_COMMENTS = gql`
  query GetCountsAndComments($articleId: Int!) {
    articleLikeCount(articleId: $articleId)
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
    articleCommentCount(articleId: $articleId)
    articleReadCount(articleId: $articleId)
    isArticleLiked(articleId: $articleId)
    hasReadArticle(articleId: $articleId)
  }
`;

export const GET_COMMENTS_WITH_REPLIES = gql`
  query GetCommentsWithReplies($articleId: Int!) {
    articleComments(articleId: $articleId) {
      id
      content
      createdAt
      likeCount
      author {
        id
        username
        firstName
        lastName
      }
      parent {
        id
        author {
          id
          username
        }
      }
      replies {
        id
        content
        createdAt
        likeCount
        author {
          id
          username
          firstName
          lastName
        }
        parent {
          id
          author {
            id
            username
          }
        }
      }
      likes {
        user {
          id
          username
        }
      }
    }
  }
`;

export const GET_COMMENTS_WITH_LIKE_STATUS = gql`
  query GetCommentsWithLikeStatus($articleId: Int!) {
    articleComments(articleId: $articleId) {
      id
      content
      createdAt
      author {
        id
        username
        firstName
        lastName
        profile {
          avatarUrl
        }
      }
      parent {
        id
        author {
          id
          username
          profile {
            avatarUrl
          }          
        }
      }
      replies {
        id
        content
        createdAt
        author {
          id
          username
          firstName
          lastName
          profile{
            avatarUrl
          }
        }
        parent {
          id
          author {
            id
            username
            profile{
              avatarUrl
            }
          }
        }
        commentLikeCount
        isCommentLiked
      }
      commentLikeCount
      isCommentLiked
    }
  }
`;
export const GET_LATEST_COMMENTS = gql`
  query GetLatestComments($articleId: Int!, $limit: Int, $offset: Int) {
    latestArticleComments(articleId: $articleId, limit: $limit, offset: $offset) {
      id
      content
      createdAt
      author {
        id
        username
        firstName
        lastName
        profile {
          avatarUrl
        }
      }
      parent {
        id
        author {
          id
          username
          profile {
            avatarUrl
          }          
        }
      }
      replies {
        id
        content
        createdAt
        author {
          id
          username
          firstName
          lastName
          profile{
            avatarUrl
          }
        }
        parent {
          id
          author {
            id
            username
            profile{
              avatarUrl
            }
          }
        }
        commentLikeCount
        isCommentLiked
      }
      commentLikeCount
      isCommentLiked
    }
  }
`;

export const GET_TOP_LIKED_COMMENTS = gql`
  query GetTopLikedComments($articleId: Int!, $limit: Int, $offset: Int) {
    topLikedComments(articleId: $articleId, limit: $limit, offset: $offset) {
      id
      content
      createdAt
      author {
        id
        username
        firstName
        lastName
        profile {
          avatarUrl
        }
      }
      parent {
        id
        author {
          id
          username
          profile {
            avatarUrl
          }          
        }
      }
      replies {
        id
        content
        createdAt
        author {
          id
          username
          firstName
          lastName
          profile{
            avatarUrl
          }
        }
        parent {
          id
          author {
            id
            username
            profile{
              avatarUrl
            }
          }
        }
        commentLikeCount
        isCommentLiked
      }
      commentLikeCount
      isCommentLiked
    }
  }
`;
export const GET_USER_COMMENT_HISTORY = gql`
  query GetUserCommentHistory($userId: Int!, $limit: Int, $offset: Int, $fromDate: Date, $toDate: Date) {
    userCommentHistory(userId: $userId, limit: $limit, offset: $offset, fromDate: $fromDate, toDate: $toDate) {
      id
      content
      createdAt
      article {
        id
        title
        slug
        featuredImageUrl
      }
    }
  }
`;

export const GET_USER_READING_HISTORY = gql`
  query GetUserReadingHistory($userId: Int!, $limit: Int, $offset: Int, $fromDate: Date, $toDate: Date) {
    userReadingHistory(userId: $userId, limit: $limit, offset: $offset, fromDate: $fromDate, toDate: $toDate) {
      id
      readAt
      article {
        id
        title
        slug
        featuredImageUrl
      }
    }
  }
`;