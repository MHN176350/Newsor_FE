import { ApolloClient, InMemoryCache, createHttpLink, from, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { getContainer } from '../core/container.js';
import { API_ENDPOINTS } from '../utils/constants.js';

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
  
  console.log('🔄 Attempting token refresh...');
  
  if (!refreshTokenValue) {
    console.error('❌ No refresh token available');
    throw new Error('No refresh token available');
  }

  try {
    console.log('📡 Sending refresh token request to backend...');
    const response = await fetch(API_ENDPOINTS.GRAPHQL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          mutation RefreshToken($refreshToken: String!) {
            refreshToken(refreshToken: $refreshToken) {
              token
              payload
              refreshToken
            }
          }
        `,
        variables: { refreshToken: refreshTokenValue },
      }),
    });

    const result = await response.json();
    console.log('📥 Refresh token response:', result);
    
    if (result.data?.refreshToken?.token) {
      const newToken = result.data.refreshToken.token;
      const newRefreshToken = result.data.refreshToken.refreshToken;
      
      console.log('✅ New access token received');
      tokenService.setToken(newToken);
      
      if (newRefreshToken) {
        console.log('✅ New refresh token received');
        tokenService.setRefreshToken(newRefreshToken);
      }
      
      return newToken;
    } else if (result.errors) {
      console.error('❌ GraphQL refresh token errors:', result.errors);
      throw new Error(result.errors[0]?.message || 'Failed to refresh token');
    } else {
      console.error('❌ Unexpected refresh token response format:', result);
      throw new Error('Failed to refresh token');
    }
  } catch (error) {
    console.error('❌ Refresh token error:', error);
    // Clear all auth data through the token service
    tokenService.clearTokens();
    const storageService = container.storageService;
    storageService.removeItem('currentUser');
    throw error;
  }
};

// Create HTTP link to GraphQL endpoint
const httpLink = createHttpLink({
  uri: API_ENDPOINTS.GRAPHQL,
});

// Create WebSocket link for subscriptions
const wsLink = new GraphQLWsLink(createClient({
  url: API_ENDPOINTS.GRAPHQL.replace('http://', 'ws://').replace('https://', 'wss://'),
  connectionParams: () => {
    const container = getContainer();
    const tokenService = container.tokenService;
    const token = tokenService.getToken();
    
    return {
      Authorization: token ? `Bearer ${token}` : "",
    };
  },
  on: {
    connected: () => console.log('🔗 WebSocket connected'),
    closed: () => console.log('🔌 WebSocket disconnected'),
    error: (error) => console.error('❌ WebSocket error:', error),
  },
}));

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
      
      // Handle JWT token expiration - more comprehensive error detection
      if ((message.includes('token') || message.includes('JWT') || message.includes('authentication') || message.includes('Signature')) &&
          (message.includes('expired') || message.includes('invalid') || message.includes('decode') || message.includes('verify'))) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
          
          if (!isRefreshing) {
            isRefreshing = true;
            
            refreshToken()
              .then((newToken) => {
                console.log('✅ Token refreshed successfully:', newToken ? 'New token received' : 'No token received');
                processQueue(null, newToken);
                resolve(forward(operation));
              })
              .catch((error) => {
                console.error('❌ Token refresh failed:', error.message);
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
    
    // Handle 401 unauthorized errors or other auth-related network errors
    if (('statusCode' in networkError && networkError.statusCode === 401) || 
        ('status' in networkError && networkError.status === 401) ||
        (networkError.message && networkError.message.includes('401'))) {
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

// Split link: send subscriptions to WebSocket, queries/mutations to HTTP
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  from([errorLink, authLink, httpLink])
);

// Create Apollo Client instance
export const apolloClient = new ApolloClient({
  link: splitLink,
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
