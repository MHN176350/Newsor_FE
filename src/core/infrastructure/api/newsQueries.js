import { gql } from '@apollo/client';

// News Queries
export const GET_NEWS_LIST = gql`
  query GetNewsList(
    $status: String
    $categoryId: Int
    $authorId: Int
    $search: String
    $tagId: Int
  ) {
    newsList(
      status: $status
      categoryId: $categoryId
      authorId: $authorId
      search: $search
      tagId: $tagId
    ) {
      id
      title
      slug
      content
      excerpt
      status
      viewCount
      likeCount
      createdAt
      updatedAt
      publishedAt
      featuredImageUrl
      metaDescription
      metaKeywords
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
        description
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
  query GetPublishedNews(
    $search: String
    $categoryId: Int
    $tagId: Int
  ) {
    publishedNews(
      search: $search
      categoryId: $categoryId
      tagId: $tagId
    ) {
      id
      title
      slug
      content
      excerpt
      viewCount
      likeCount
      createdAt
      updatedAt
      publishedAt
      featuredImageUrl
      metaDescription
      metaKeywords
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
        description
      }
      tags {
        id
        name
        slug
      }
    }
  }
`;

export const GET_NEWS_ARTICLE = gql`
  query GetNewsArticle($id: Int, $slug: String) {
    newsArticle(id: $id, slug: $slug) {
      id
      title
      slug
      content
      excerpt
      status
      viewCount
      likeCount
      createdAt
      updatedAt
      publishedAt
      featuredImageUrl
      metaDescription
      metaKeywords
      author {
        id
        username
        firstName
        lastName
        profile {
          id
          role
          bio
          avatarUrl
        }
      }
      category {
        id
        name
        slug
        description
      }
      tags {
        id
        name
        slug
      }
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
      success
      errors
      news {
        id
        title
        slug
        content
        excerpt
        status
        viewCount
        likeCount
        createdAt
        updatedAt
        publishedAt
        featuredImageUrl
        metaDescription
        metaKeywords
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
          description
        }
        tags {
          id
          name
          slug
        }
      }
    }
  }
`;
