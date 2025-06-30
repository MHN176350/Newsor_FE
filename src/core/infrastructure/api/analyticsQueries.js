import { gql } from '@apollo/client';

// Analytics Queries
export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    dashboardStats {
      # User statistics
      totalUsers
      totalReaders
      totalWriters
      totalManagers
      totalAdmins
      newUsersThisMonth
      
      # News statistics
      totalNews
      publishedNews
      draftNews
      pendingNews
      rejectedNews
      newsThisMonth
      
      # Category and Tag statistics
      totalCategories
      totalTags
      
      # Activity statistics
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
        profile {
          avatarUrl
        }
      }
    }
  }
`;

export const GET_USER_READING_HISTORY = gql`
  query GetUserReadingHistory($userId: Int!) {
    userReadingHistory(userId: $userId) {
      id
      readAt
      article {
        id
        title
        slug
        featuredImageUrl
        category {
          name
        }
      }
    }
  }
`;

// Upload Mutations
export const GET_CLOUDINARY_SIGNATURE = gql`
  mutation GetCloudinarySignature {
    getCloudinarySignature {
      success
      errors
      signature
      timestamp
      apiKey
      cloudName
      folder
    }
  }
`;
