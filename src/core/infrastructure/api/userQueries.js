import { gql } from '@apollo/client';

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
          hasWritePermission
          hasAdminPermission
          hasManagerPermission
        }
      }
    }
  }
`;

export const REFRESH_TOKEN = gql`
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      token
      refreshToken
    }
  }
`;

// User Queries
export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      id
      username
      email
      firstName
      lastName
      isActive
      dateJoined
      lastLogin
      profile {
        id
        role
        bio
        phone
        dateOfBirth
        avatarUrl
        isVerified
        createdAt
        updatedAt
        hasWritePermission
        hasAdminPermission
        hasManagerPermission
      }
    }
  }
`;

export const GET_ALL_USERS = gql`
  query GetAllUsers {
    users {
      id
      username
      email
      firstName
      lastName
      isActive
      dateJoined
      lastLogin
      profile {
        id
        role
        bio
        phone
        dateOfBirth
        avatarUrl
        isVerified
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_USER_BY_ID = gql`
  query GetUserById($id: Int!) {
    user(id: $id) {
      id
      username
      email
      firstName
      lastName
      isActive
      dateJoined
      lastLogin
      profile {
        id
        role
        bio
        phone
        dateOfBirth
        avatarUrl
        isVerified
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_USER_PROFILE = gql`
  query GetUserProfile($userId: Int!) {
    userProfile(userId: $userId) {
      id
      role
      bio
      phone
      dateOfBirth
      avatarUrl
      isVerified
      createdAt
      updatedAt
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
      success
      errors
      user {
        id
        username
        email
        firstName
        lastName
        isActive
        dateJoined
        profile {
          id
          role
          bio
          phone
          dateOfBirth
          avatarUrl
          isVerified
          createdAt
          updatedAt
        }
      }
    }
  }
`;

export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile(
    $bio: String
    $phone: String
    $dateOfBirth: Date
    $avatar: String
  ) {
    updateUserProfile(
      bio: $bio
      phone: $phone
      dateOfBirth: $dateOfBirth
      avatar: $avatar
    ) {
      success
      errors
      profile {
        id
        role
        bio
        phone
        dateOfBirth
        avatarUrl
        isVerified
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
      user {
        id
        username
        email
        firstName
        lastName
        isActive
        dateJoined
        profile {
          id
          role
          bio
          phone
          dateOfBirth
          avatarUrl
          isVerified
          createdAt
          updatedAt
        }
      }
    }
  }
`;

// Image Upload Mutations
export const UPLOAD_BASE64_IMAGE = gql`
  mutation UploadBase64Image(
    $base64Data: String!
    $folder: String
    $maxWidth: Int
    $maxHeight: Int
    $quality: String
    $format: String
  ) {
    uploadBase64Image(
      base64Data: $base64Data
      folder: $folder
      maxWidth: $maxWidth
      maxHeight: $maxHeight
      quality: $quality
      format: $format
    ) {
      url
      publicId
      success
      errors
    }
  }
`;

export const UPLOAD_AVATAR_IMAGE = gql`
  mutation UploadAvatarImage($base64Data: String!) {
    uploadAvatarImage(base64Data: $base64Data) {
      profile {
        id
        role
        bio
        phone
        dateOfBirth
        avatarUrl
        isVerified
        createdAt
        updatedAt
      }
      success
      errors
    }
  }
`;

export const UPLOAD_REGISTRATION_AVATAR_IMAGE = gql`
  mutation UploadRegistrationAvatarImage($base64Data: String!) {
    uploadRegistrationAvatarImage(base64Data: $base64Data) {
      url
      success
      errors
    }
  }
`;
