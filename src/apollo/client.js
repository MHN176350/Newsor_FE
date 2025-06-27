import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { getToken, getRefreshToken, setToken, clearAuthData } from '../utils/constants';

// Variable to track if we're currently refreshing
let isRefreshing = false;
let failedQueue = [];

// Function to process failed requests after token refresh
const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Function to refresh token
const refreshToken = async () => {
  const refreshTokenValue = getRefreshToken();
  
  if (!refreshTokenValue) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await fetch('http://localhost:8000/graphql/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          mutation RefreshToken($refreshToken: String!) {
            refreshToken(refreshToken: $refreshToken) {
              token
            }
          }
        `,
        variables: { refreshToken: refreshTokenValue },
      }),
    });

    const result = await response.json();
    
    if (result.data?.refreshToken?.token) {
      const newToken = result.data.refreshToken.token;
      setToken(newToken);
      return newToken;
    } else {
      throw new Error('Failed to refresh token');
    }
  } catch (error) {
    clearAuthData();
    throw error;
  }
};

// Create HTTP link to GraphQL endpoint
const httpLink = createHttpLink({
  uri: 'http://localhost:8000/graphql/',
});

// Authentication link to add JWT token to requests
const authLink = setContext((_, { headers }) => {
  // Get the authentication token from local storage if it exists
  const token = getToken();
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
      'Content-Type': 'application/json',
    }
  };
});

// Error handling link with automatic token refresh
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
      
      // Handle JWT token expiration
      if (message.includes('token') && (message.includes('expired') || message.includes('invalid'))) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
          
          if (!isRefreshing) {
            isRefreshing = true;
            
            refreshToken()
              .then((newToken) => {
                processQueue(null, newToken);
                resolve(forward(operation));
              })
              .catch((error) => {
                processQueue(error, null);
                clearAuthData();
                window.location.href = '/login';
                reject(error);
              })
              .finally(() => {
                isRefreshing = false;
              });
          }
        });
      }
    });
  }

  if (networkError) {
    console.error(`Network error: ${networkError}`);
    
    // Handle 401 unauthorized errors
    if ('statusCode' in networkError && networkError.statusCode === 401) {
      if (!isRefreshing) {
        isRefreshing = true;
        
        return refreshToken()
          .then((newToken) => {
            isRefreshing = false;
            return forward(operation);
          })
          .catch((error) => {
            isRefreshing = false;
            clearAuthData();
            window.location.href = '/login';
            return Promise.reject(error);
          });
      }
    }
  }
});

// Create Apollo Client instance
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          newsList: {
            merge(_, incoming) {
              return incoming;
            },
          },
          publishedNews: {
            merge(_, incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

export default apolloClient;
