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


// Notification Mutations
export const MARK_NOTIFICATION_AS_READ = gql`
  mutation MarkNotificationAsRead($notificationId: Int!) {
    markNotificationAsRead(notificationId: $notificationId) {
      success
      notification {
        id
        isRead
        readAt
      }
      errors
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_AS_READ = gql`
  mutation MarkAllNotificationsAsRead {
    markAllNotificationsAsRead {
      success
      count
      errors
    }
  }
`;

export const UPDATE_EMAIL_TEMPLATE = gql`
  mutation UpdateEmailTemplate($subject: String, $htmlContent: String) {
    updateEmailTemplate(subject: $subject, htmlContent: $htmlContent) {
      success
      errors
      emailTemplate {
        subject
        htmlContent
      }
    }
  }
`;
