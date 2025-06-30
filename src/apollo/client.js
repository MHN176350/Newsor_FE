import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { getContainer } from '../core/container.js';

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
  const container = getContainer();
  const tokenService = container.tokenService;
  const refreshTokenValue = tokenService.getRefreshToken();
  
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
      tokenService.setToken(newToken);
      return newToken;
    } else {
      throw new Error('Failed to refresh token');
    }
  } catch (error) {
    // Clear all auth data through the token service
    tokenService.clearTokens();
    const storageService = container.storageService;
    storageService.removeItem('currentUser');
    throw error;
  }
};

// Create HTTP link to GraphQL endpoint
const httpLink = createHttpLink({
  uri: 'http://localhost:8000/graphql/',
});

// Authentication link to add JWT token to requests
const authLink = setContext((_, { headers }) => {
  
  const container = getContainer();
  const tokenService = container.tokenService;
  const token = tokenService.getToken();
  
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
                // Clear auth data through the container
                const container = getContainer();
                const tokenService = container.tokenService;
                const storageService = container.storageService;
                tokenService.clearTokens();
                storageService.removeItem('currentUser');
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
            // Clear auth data through the container
            const container = getContainer();
            const tokenService = container.tokenService;
            const storageService = container.storageService;
            tokenService.clearTokens();
            storageService.removeItem('currentUser');
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
