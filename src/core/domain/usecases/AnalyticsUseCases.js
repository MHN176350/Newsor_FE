/**
 * Use case for getting dashboard statistics
 */
export class GetDashboardStatsUseCase {
  constructor(analyticsRepository, authService) {
    this.analyticsRepository = analyticsRepository;
    this.authService = authService;
  }

  async execute() {
    const currentUser = await this.authService.getCurrentUser();
    if (!currentUser || !currentUser.profile?.hasManagerPermission) {
      throw new Error('Permission denied. Manager role required.');
    }

    return await this.analyticsRepository.getDashboardStats();
  }
}

/**
 * Use case for getting recent activity
 */
export class GetRecentActivityUseCase {
  constructor(analyticsRepository, authService) {
    this.analyticsRepository = analyticsRepository;
    this.authService = authService;
  }

  async execute(limit = 10) {
    const currentUser = await this.authService.getCurrentUser();
    if (!currentUser || !currentUser.profile?.hasManagerPermission) {
      throw new Error('Permission denied. Manager role required.');
    }

    return await this.analyticsRepository.getRecentActivity(limit);
  }
}
