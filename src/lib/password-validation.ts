/**
 * Password validation rules for ISS Hapkido Indonesia
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 number
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password minimal 8 karakter");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password harus mengandung minimal 1 huruf besar");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password harus mengandung minimal 1 angka");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function getPasswordRequirements(): string[] {
  return [
    "Minimal 8 karakter",
    "Minimal 1 huruf besar (A-Z)",
    "Minimal 1 angka (0-9)",
  ];
}
