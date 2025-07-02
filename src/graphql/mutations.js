import { gql } from '@apollo/client';

// Image Upload Mutations
export const GET_CLOUDINARY_SIGNATURE = gql`
  mutation GetCloudinarySignature {
    getCloudinarySignature {
      signature
      timestamp
      apiKey
      cloudName
      folder
      success
      errors
    }
  }
`;

// Authentication Mutations
export const LOGIN_USER = gql`
  mutation LoginUser($username: String!, $password: String!) {
    tokenAuth(username: $username, password: $password) {
      token
      refreshToken
      user {
        id
        username
        email
        firstName
        lastName
        profile {
          role
          bio
          avatarUrl
        }
      }
    }
  }
`;

export const VERIFY_TOKEN = gql`
  mutation VerifyToken($token: String!) {
    verifyToken(token: $token) {
      payload
    }
  }
`;

export const REFRESH_TOKEN = gql`
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      token
      payload
    }
  }
`;

// User Mutations
export const CREATE_USER = gql`
  mutation CreateUser(
    $username: String!
    $email: String!
    $password: String!
    $firstName: String
    $lastName: String
    $avatar: String
  ) {
    createUser(
      username: $username
      email: $email
      password: $password
      firstName: $firstName
      lastName: $lastName
      avatar: $avatar
    ) {
      user {
        id
        username
        email
        firstName
        lastName
        profile {
          avatarUrl
        }
      }
      success
      errors
    }
  }
`;

export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile(
    $bio: String
    $avatar: String
    $phone: String
    $dateOfBirth: Date
  ) {
    updateUserProfile(
      bio: $bio
      avatar: $avatar
      phone: $phone
      dateOfBirth: $dateOfBirth
    ) {
      profile {
        id
        bio
        avatarUrl
        phone
        dateOfBirth
        updatedAt
      }
      success
      errors
    }
  }
`;

// News Mutations
export const CREATE_NEWS = gql`
  mutation CreateNews(
    $title: String!
    $content: String!
    $excerpt: String!
    $categoryId: Int!
    $tagIds: [Int]
    $featuredImage: String
    $metaDescription: String
    $metaKeywords: String
  ) {
    createNews(
      title: $title
      content: $content
      excerpt: $excerpt
      categoryId: $categoryId
      tagIds: $tagIds
      featuredImage: $featuredImage
      metaDescription: $metaDescription
      metaKeywords: $metaKeywords
    ) {
      news {
        id
        title
        content
        excerpt
        featuredImageUrl
        status
        createdAt
        category {
          id
          name
        }
        tags {
          id
          name
        }
      }
      success
      errors
    }
  }
`;

export const UPDATE_NEWS = gql`
  mutation UpdateNews(
    $id: Int!
    $title: String
    $content: String
    $excerpt: String
    $featuredImage: String
    $categoryId: Int
    $tagIds: [Int!]
    $status: String
  ) {
    updateNews(
      id: $id
      title: $title
      content: $content
      excerpt: $excerpt
      featuredImage: $featuredImage
      categoryId: $categoryId
      tagIds: $tagIds
      status: $status
    ) {
      news {
        id
        title
        content
        excerpt
        featuredImage
        status
        updatedAt
        category {
          id
          name
        }
        tags {
          id
          name
        }
      }
      success
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

export const PUBLISH_NEWS = gql`
  mutation PublishNews($id: Int!) {
    publishNews(id: $id) {
      news {
        id
        title
        status
        isPublished
        publishedAt
      }
      success
      errors
    }
  }
`;

export const APPROVE_NEWS = gql`
  mutation ApproveNews($id: Int!) {
    approveNews(id: $id) {
      news {
        id
        title
        status
        updatedAt
      }
      success
      errors
    }
  }
`;

export const REJECT_NEWS = gql`
  mutation RejectNews($id: Int!, $reason: String) {
    rejectNews(id: $id, reason: $reason) {
      news {
        id
        title
        status
        updatedAt
      }
      success
      errors
    }
  }
`;

// Comment Mutations
export const CREATE_COMMENT = gql`
  mutation CreateComment($articleId: Int!, $content: String!, $parentId: Int) {
    createComment(articleId: $articleId, content: $content, parentId: $parentId) {
      comment {
        id
        content
        createdAt
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
      success
      errors
    }
  }
`;

export const UPDATE_COMMENT = gql`
  mutation UpdateComment($id: Int!, $content: String!) {
    updateComment(id: $id, content: $content) {
      comment {
        id
        content
        updatedAt
      }
      success
      errors
    }
  }
`;

export const DELETE_COMMENT = gql`
  mutation DeleteComment($id: Int!) {
    deleteComment(id: $id) {
      success
      errors
    }
  }
`;

// Like Mutations
export const CREATE_LIKE_ARTICLE = gql`
  mutation CreateLikeArticle($articleId: Int!) {
    createLikeArticle(articleId: $articleId) {
      success
      errors
    }
  }
`;

export const CREATE_LIKE_COMMENT = gql`
  mutation CreateLikeComment($commentId: Int!) {
    createLikeComment(commentId: $commentId) {
      success
      errors
    }
  }
`;

export const UPDATE_LIKE_STATUS = gql`
  mutation UpdateLikeStatus($articleId: Int, $commentId: Int) {
    updateLikeStatus(articleId: $articleId, commentId: $commentId) {
      success
      errors
    }
  }
`;

// Category Mutations
export const CREATE_CATEGORY = gql`
  mutation CreateCategory($name: String!, $description: String) {
    createCategory(name: $name, description: $description) {
      category {
        id
        name
        slug
        description
      }
      success
      errors
    }
  }
`;

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: Int!, $name: String, $description: String) {
    updateCategory(id: $id, name: $name, description: $description) {
      category {
        id
        name
        slug
        description
      }
      success
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

// Tag Mutations
export const CREATE_TAG = gql`
  mutation CreateTag($name: String!) {
    createTag(name: $name) {
      tag {
        id
        name
        slug
      }
      success
      errors
    }
  }
`;

export const UPDATE_TAG = gql`
  mutation UpdateTag($id: Int!, $name: String!) {
    updateTag(id: $id, name: $name) {
      tag {
        id
        name
        slug
      }
      success
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

// Admin Mutations
export const CHANGE_USER_ROLE = gql`
  mutation ChangeUserRole($userId: Int!, $newRole: String!) {
    changeUserRole(userId: $userId, newRole: $newRole) {
      success
      errors
      user {
        id
        username
        firstName
        lastName
        profile {
          role
        }
      }
    }
  }
`;

// Reading History Mutations
export const CREATE_READING_HISTORY = gql`
  mutation CreateReadingHistory($articleId: Int!, $ipAddress: String, $userAgent: String) {
    createReadinghistory(
      articleId: $articleId
      ipAddress: $ipAddress
      userAgent: $userAgent
    ) {
      success
      errors
    }
  }
`;
