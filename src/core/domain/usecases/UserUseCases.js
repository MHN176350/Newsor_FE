/**
 * Use case for user authentication
 */
export class AuthenticateUserUseCase {
  constructor(userRepository, authService) {
    this.userRepository = userRepository;
    this.authService = authService;
  }

  async execute(credentials) {
    // Validate credentials
    if (!credentials.username?.trim()) {
      throw new Error('Username is required');
    }
    if (!credentials.password?.trim()) {
      throw new Error('Password is required');
    }

    // Authenticate user
    return await this.authService.login(credentials);
  }
}

/**
 * Use case for user registration
 */
export class RegisterUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(userData) {
    // Validate required fields
    if (!userData.username?.trim()) {
      throw new Error('Username is required');
    }
    if (!userData.email?.trim()) {
      throw new Error('Email is required');
    }
    if (!userData.password?.trim()) {
      throw new Error('Password is required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new Error('Invalid email format');
    }

    // Validate password strength
    if (userData.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    return await this.userRepository.createUser(userData);
  }
}

/**
 * Use case for updating user profile
 */
export class UpdateUserProfileUseCase {
  constructor(userRepository, authService) {
    this.userRepository = userRepository;
    this.authService = authService;
  }

  async execute(profileData) {
    const currentUser = await this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('Authentication required');
    }

    return await this.userRepository.updateUserProfile(profileData);
  }
}

/**
 * Use case for changing user role (admin only)
 */
export class ChangeUserRoleUseCase {
  constructor(userRepository, authService) {
    this.userRepository = userRepository;
    this.authService = authService;
  }

  async execute(userId, newRole) {
    const currentUser = await this.authService.getCurrentUser();
    if (!currentUser || !currentUser.profile?.hasAdminPermission) {
      throw new Error('Permission denied. Admin role required.');
    }

    const validRoles = ['reader', 'writer', 'manager', 'admin'];
    if (!validRoles.includes(newRole)) {
      throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }

    return await this.userRepository.changeUserRole(userId, newRole);
  }
}

/**
 * Use case for getting current user
 */
export class GetCurrentUserUseCase {
  constructor(authService) {
    this.authService = authService;
  }

  async execute() {
    return await this.authService.getCurrentUser();
  }
}
