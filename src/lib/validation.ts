/**
 * Validation utilities for comment system
 * Provides secure input validation for guest comments
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate guest password strength
 * Requirements:
 * - Minimum 6 characters
 * - Maximum 72 characters (bcrypt limit)
 * - Must contain number OR special character
 * - Cannot be common weak password
 */
export function validateGuestPassword(password: string): ValidationResult {
  // Minimum length
  if (password.length < 6) {
    return {
      valid: false,
      error: '비밀번호는 최소 6자 이상이어야 합니다.',
    };
  }

  // Maximum length (bcrypt has 72 byte limit)
  if (password.length > 72) {
    return {
      valid: false,
      error: '비밀번호는 최대 72자까지 가능합니다.',
    };
  }

  // Check for common weak passwords
  const weakPasswords = [
    'password',
    '123456',
    '12345678',
    'qwerty',
    'abc123',
    'password1',
    '111111',
    '123123',
    'admin',
    'letmein',
    '비밀번호',
    '1234',
    '000000',
    'guest',
    'user',
    'password123',
  ];

  if (weakPasswords.includes(password.toLowerCase())) {
    return {
      valid: false,
      error: '너무 약한 비밀번호입니다. 다른 비밀번호를 사용해주세요.',
    };
  }

  // Require at least one number OR special character
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!hasNumber && !hasSpecialChar) {
    return {
      valid: false,
      error: '비밀번호는 숫자 또는 특수문자를 포함해야 합니다.',
    };
  }

  return { valid: true };
}

/**
 * Validate guest name
 * Requirements:
 * - Not empty after trim
 * - Maximum 50 characters
 * - No HTML/script injection attempts
 */
export function validateGuestName(name: string): ValidationResult {
  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: '이름을 입력해주세요.' };
  }

  if (trimmed.length < 2) {
    return { valid: false, error: '이름은 최소 2자 이상이어야 합니다.' };
  }

  if (trimmed.length > 50) {
    return { valid: false, error: '이름은 최대 50자까지 가능합니다.' };
  }

  // Prevent HTML/script injection in names
  if (/<|>|javascript:/i.test(trimmed)) {
    return { valid: false, error: '올바르지 않은 문자가 포함되어 있습니다.' };
  }

  return { valid: true };
}

/**
 * Validate comment content
 * Requirements:
 * - Not empty after trim
 * - Maximum 5000 characters
 */
export function validateContent(content: string): ValidationResult {
  const trimmed = content.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: '내용을 입력해주세요.' };
  }

  if (trimmed.length > 5000) {
    return { valid: false, error: '내용은 최대 5000자까지 가능합니다.' };
  }

  return { valid: true };
}
