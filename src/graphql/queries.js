import { gql } from '@apollo/client';

// Authentication queries
export const LOGIN_USER = gql`
  mutation TokenAuth($username: String!, $password: String!) {
    tokenAuth(username: $username, password: $password) {
      token
      refreshToken
      user {
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
        }
      }
    }
  }
`;

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
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
      }
    }
  }
`;

// Dashboard queries
export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    dashboardStats {
      totalUsers
      totalNews
      publishedNews
      pendingNews
      draftNews
      totalViews
      totalLikes
      totalComments
      totalCategories
      totalTags
      newUsersThisMonth
      newsThisMonth
      totalReaders
      totalWriters
      totalManagers
      totalAdmins
    }
  }
`;

export const GET_RECENT_ACTIVITY = gql`
  query GetRecentActivity($limit: Int) {
    recentActivity(limit: $limit) {
      id
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

// User management queries
export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      username
      email
      firstName
      lastName
      isActive
      dateJoined
      profile {
        role
        bio
        avatarUrl
        createdAt
        updatedAt
      }
    }
  }
`;

export const CHANGE_USER_ROLE = gql`
  mutation ChangeUserRole($userId: Int!, $newRole: String!) {
    changeUserRole(userId: $userId, newRole: $newRole) {
      success
      errors
    }
  }
`;

// Categories queries
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

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($name: String!, $description: String) {
    createCategory(name: $name, description: $description) {
      success
      category {
        id
        name
        description
        createdAt
        updatedAt
      }
      errors
    }
  }
`;

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: Int!, $name: String!, $description: String) {
    updateCategory(id: $id, name: $name, description: $description) {
      success
      category {
        id
        name
        description
        createdAt
        updatedAt
      }
      errors
    }
  }
`;

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: Int!) {
    deleteCategory(id: $id) {
      success
      errors
    }
  }
`;

// Tags queries
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

export const CREATE_TAG = gql`
  mutation CreateTag($name: String!) {
    createTag(name: $name) {
      success
      tag {
        id
        name
        isActive
        createdAt
      }
      errors
    }
  }
`;

export const UPDATE_TAG = gql`
  mutation UpdateTag($id: Int!, $name: String!) {
    updateTag(id: $id, name: $name) {
      success
      tag {
        id
        name
        isActive
        createdAt
      }
      errors
    }
  }
`;

export const DELETE_TAG = gql`
  mutation DeleteTag($id: Int!) {
    deleteTag(id: $id) {
      success
      errors
    }
  }
`;

export const TOGGLE_TAG = gql`
  mutation ToggleTag($id: Int!) {
    toggleTag(id: $id) {
      success
      tag {
        id
        name
        isActive
        createdAt
      }
      errors
    }
  }
`;

// News/Articles queries
export const GET_NEWS_LIST = gql`
  query GetNewsList($status: String, $categoryId: Int, $tagId: Int, $authorId: Int, $search: String) {
    newsList(status: $status, categoryId: $categoryId, tagId: $tagId, authorId: $authorId, search: $search) {
      id
      title
      slug
      excerpt
      content
      status
      publishedAt
      createdAt
      updatedAt
      viewCount
      likeCount
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
      featuredImageUrl
    }
  }
`;

export const UPDATE_NEWS_STATUS = gql`
  mutation UpdateNewsStatus($id: Int!, $status: String!) {
    updateNewsStatus(id: $id, status: $status) {
      success
      news {
        id
        title
        status
        publishedAt
        updatedAt
      }
      errors
    }
  }
`;

export const DELETE_NEWS = gql`
  mutation DeleteNews($id: Int!) {
    deleteNews(id: $id) {
      success
      errors
    }
  }
`;
