import { gql } from '@apollo/client';

// Category Queries
export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      slug
      description
      isActive
      createdAt
      updatedAt
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
      isActive
      createdAt
      updatedAt
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
      updatedAt
    }
  }
`;

// Comment Queries
export const GET_ARTICLE_COMMENTS = gql`
  query GetArticleComments($articleId: Int!) {
    articleComments(articleId: $articleId) {
      id
      content
      status
      createdAt
      updatedAt
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
      }
    }
  }
`;

// Category Mutations
export const CREATE_CATEGORY = gql`
  mutation CreateCategory(
    $name: String!
    $slug: String!
    $description: String!
  ) {
    createCategory(
      name: $name
      slug: $slug
      description: $description
    ) {
      success
      errors
      category {
        id
        name
        slug
        description
        isActive
        createdAt
        updatedAt
      }
    }
  }
`;

// Tag Mutations
export const CREATE_TAG = gql`
  mutation CreateTag(
    $name: String!
    $slug: String!
  ) {
    createTag(
      name: $name
      slug: $slug
    ) {
      success
      errors
      tag {
        id
        name
        slug
        createdAt
        updatedAt
      }
    }
  }
`;

// Comment Mutations
export const CREATE_COMMENT = gql`
  mutation CreateComment(
    $articleId: ID!
    $content: String!
    $parentId: ID
  ) {
    createComment(
      articleId: $articleId
      content: $content
      parentId: $parentId
    ) {
      success
      errors
      comment {
        id
        content
        status
        createdAt
        updatedAt
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
        }
      }
    }
  }
`;
