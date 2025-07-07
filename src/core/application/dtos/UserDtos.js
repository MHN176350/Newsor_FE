/**
 * Data Transfer Objects for API communication
 */

/**
 * Login request DTO
 */
export class LoginRequestDto {
  constructor(username, password) {
    this.username = username;
    this.password = password;
  }
}

/**
 * Register request DTO
 */
export class RegisterRequestDto {
  constructor({
    username,
    email,
    password,
    firstName,
    lastName,
    avatar
  }) {
    this.username = username;
    this.email = email;
    this.password = password;
    this.firstName = firstName;
    this.lastName = lastName;
    this.avatar = avatar;
  }
}

/**
 * Update profile request DTO
 */
export class UpdateProfileRequestDto {
  constructor({
    bio,
    phone,
    dateOfBirth,
    avatar
  }) {
    this.bio = bio;
    this.phone = phone;
    this.dateOfBirth = dateOfBirth;
    this.avatar = avatar;
  }
}

/**
 * Change role request DTO
 */
export class ChangeRoleRequestDto {
  constructor(userId, newRole) {
    this.userId = userId;
    this.newRole = newRole;
  }
}
