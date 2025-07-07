import { ApolloClient } from '@apollo/client';

// Services
import { AuthService, TokenService, StorageService } from './application/services/index.js';
import { ImageService } from './application/services/ImageService.js';

// Repositories
import {
  GraphQLUserRepository,
  GraphQLNewsRepository,
  GraphQLAnalyticsRepository,
  GraphQLUploadRepository
} from './infrastructure/repositories/index.js';

// Use Cases
import {
  CreateNewsUseCase,
  UpdateNewsUseCase,
  PublishNewsUseCase,
  GetPublishedNewsUseCase,
  SearchNewsUseCase,
  AuthenticateUserUseCase,
  RegisterUserUseCase,
  UpdateUserProfileUseCase,
  ChangeUserRoleUseCase,
  GetCurrentUserUseCase,
  GetDashboardStatsUseCase,
  GetRecentActivityUseCase
} from './domain/usecases/index.js';

/**
 * Dependency Injection Container for Clean Architecture
 */
export class DIContainer {
  constructor(apolloClient) {
    this.apolloClient = apolloClient;
    this._services = new Map();
    this._repositories = new Map();
    this._useCases = new Map();
    
    this._initializeServices();
    this._initializeRepositories();
    this._initializeUseCases();
  }

  // Service getters
  get authService() {
    return this._services.get('authService');
  }

  get tokenService() {
    return this._services.get('tokenService');
  }

  get storageService() {
    return this._services.get('storageService');
  }

  get imageService() {
    return this._services.get('imageService');
  }

  // Repository getters
  get userRepository() {
    return this._repositories.get('userRepository');
  }

  get newsRepository() {
    return this._repositories.get('newsRepository');
  }

  get analyticsRepository() {
    return this._repositories.get('analyticsRepository');
  }

  get uploadRepository() {
    return this._repositories.get('uploadRepository');
  }

  // Use case getters
  get createNewsUseCase() {
    return this._useCases.get('createNewsUseCase');
  }

  get updateNewsUseCase() {
    return this._useCases.get('updateNewsUseCase');
  }

  get publishNewsUseCase() {
    return this._useCases.get('publishNewsUseCase');
  }

  get getPublishedNewsUseCase() {
    return this._useCases.get('getPublishedNewsUseCase');
  }

  get searchNewsUseCase() {
    return this._useCases.get('searchNewsUseCase');
  }

  get authenticateUserUseCase() {
    return this._useCases.get('authenticateUserUseCase');
  }

  get registerUserUseCase() {
    return this._useCases.get('registerUserUseCase');
  }

  get updateUserProfileUseCase() {
    return this._useCases.get('updateUserProfileUseCase');
  }

  get changeUserRoleUseCase() {
    return this._useCases.get('changeUserRoleUseCase');
  }

  get getCurrentUserUseCase() {
    return this._useCases.get('getCurrentUserUseCase');
  }

  get getDashboardStatsUseCase() {
    return this._useCases.get('getDashboardStatsUseCase');
  }

  get getRecentActivityUseCase() {
    return this._useCases.get('getRecentActivityUseCase');
  }

  // Private initialization methods
  _initializeServices() {
    // Create storage service
    const storageService = new StorageService();
    this._services.set('storageService', storageService);

    // Create token service
    const tokenService = new TokenService(storageService);
    this._services.set('tokenService', tokenService);

    // Create auth service (will be initialized after repositories)
    this._services.set('authService', null); // Placeholder

    // Create image service (will be initialized after repositories)
    this._services.set('imageService', null); // Placeholder
  }

  _initializeRepositories() {
    // Create repositories
    const userRepository = new GraphQLUserRepository(this.apolloClient);
    const newsRepository = new GraphQLNewsRepository(this.apolloClient);
    const analyticsRepository = new GraphQLAnalyticsRepository(this.apolloClient);
    const uploadRepository = new GraphQLUploadRepository(this.apolloClient);

    this._repositories.set('userRepository', userRepository);
    this._repositories.set('newsRepository', newsRepository);
    this._repositories.set('analyticsRepository', analyticsRepository);
    this._repositories.set('uploadRepository', uploadRepository);

    // Now initialize auth service with dependencies
    const authService = new AuthService(
      userRepository,
      this.tokenService,
      this.storageService
    );
    this._services.set('authService', authService);

    // Initialize image service with dependencies
    const imageService = new ImageService(userRepository);
    this._services.set('imageService', imageService);
  }

  _initializeUseCases() {
    const authService = this.authService;
    const userRepository = this.userRepository;
    const newsRepository = this.newsRepository;
    const analyticsRepository = this.analyticsRepository;

    // News use cases
    this._useCases.set('createNewsUseCase', new CreateNewsUseCase(newsRepository, authService));
    this._useCases.set('updateNewsUseCase', new UpdateNewsUseCase(newsRepository, authService));
    this._useCases.set('publishNewsUseCase', new PublishNewsUseCase(newsRepository, authService));
    this._useCases.set('getPublishedNewsUseCase', new GetPublishedNewsUseCase(newsRepository));
    this._useCases.set('searchNewsUseCase', new SearchNewsUseCase(newsRepository));

    // User use cases
    this._useCases.set('authenticateUserUseCase', new AuthenticateUserUseCase(userRepository, authService));
    this._useCases.set('registerUserUseCase', new RegisterUserUseCase(userRepository));
    this._useCases.set('updateUserProfileUseCase', new UpdateUserProfileUseCase(userRepository, authService));
    this._useCases.set('changeUserRoleUseCase', new ChangeUserRoleUseCase(userRepository, authService));
    this._useCases.set('getCurrentUserUseCase', new GetCurrentUserUseCase(authService));

    // Analytics use cases
    this._useCases.set('getDashboardStatsUseCase', new GetDashboardStatsUseCase(analyticsRepository, authService));
    this._useCases.set('getRecentActivityUseCase', new GetRecentActivityUseCase(analyticsRepository, authService));
  }
}

// Global container instance
let containerInstance = null;

/**
 * Initialize the DI container with Apollo Client
 */
export function initializeContainer(apolloClient) {
  containerInstance = new DIContainer(apolloClient);
  return containerInstance;
}

/**
 * Get the current container instance
 */
export function getContainer() {
  if (!containerInstance) {
    throw new Error('Container not initialized. Call initializeContainer first.');
  }
  return containerInstance;
}

/**
 * Export container instance for convenience
 */
export const container = {
  get imageService() {
    return getContainer().imageService;
  },
  get authService() {
    return getContainer().authService;
  },
  get tokenService() {
    return getContainer().tokenService;
  },
  get storageService() {
    return getContainer().storageService;
  },
  get userRepository() {
    return getContainer().userRepository;
  },
  get newsRepository() {
    return getContainer().newsRepository;
  },
  get analyticsRepository() {
    return getContainer().analyticsRepository;
  },
  get uploadRepository() {
    return getContainer().uploadRepository;
  },
  resolve(serviceName) {
    return getContainer().resolve(serviceName);
  }
};
