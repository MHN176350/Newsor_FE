/**
 * User domain entity
 */
export class User {
  constructor({
    id,
    username,
    email,
    firstName,
    lastName,
    isActive,
    dateJoined,
    lastLogin,
    profile
  }) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.isActive = isActive;
    this.dateJoined = dateJoined;
    this.lastLogin = lastLogin;
    this.profile = profile;
  }

  get fullName() {
    return `${this.firstName} ${this.lastName}`.trim() || this.username;
  }

  get isAuthenticated() {
    return !!this.id;
  }
}

/**
 * UserProfile domain entity
 */
export class UserProfile {
  constructor({
    id,
    userId,
    role,
    bio,
    phone,
    dateOfBirth,
    avatarUrl,
    isVerified,
    createdAt,
    updatedAt,
    hasWritePermission,
    hasAdminPermission,
    hasManagerPermission
  }) {
    this.id = id;
    this.userId = userId;
    this.role = role;
    this.bio = bio;
    this.phone = phone;
    this.dateOfBirth = dateOfBirth;
    this.avatarUrl = avatarUrl;
    this.isVerified = isVerified;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    
    // Use server values if provided, otherwise compute from role
    this._hasWritePermission = hasWritePermission;
    this._hasAdminPermission = hasAdminPermission;
    this._hasManagerPermission = hasManagerPermission;
  }

  get hasWritePermission() {
    return this._hasWritePermission !== undefined ? 
      this._hasWritePermission : 
      ['writer', 'manager', 'admin'].includes(this.role?.toLowerCase());
  }

  get hasAdminPermission() {
    return this._hasAdminPermission !== undefined ? 
      this._hasAdminPermission : 
      ['admin'].includes(this.role?.toLowerCase());
  }

  get hasManagerPermission() {
    return this._hasManagerPermission !== undefined ? 
      this._hasManagerPermission : 
      ['manager', 'admin'].includes(this.role?.toLowerCase());
  }
}

/**
 * User roles enum
 */
export const UserRole = {
  READER: 'reader',
  WRITER: 'writer',
  MANAGER: 'manager',
  ADMIN: 'admin'
};
