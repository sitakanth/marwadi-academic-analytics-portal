export function validateGrade(grade: string): boolean {
  const validGrades = ['O', 'A+', 'A', 'B+', 'B', 'C', 'D', 'F', 'S'];
  return validGrades.includes(grade);
}

export function validateSGPA(sgpa: number): { valid: boolean; message: string } {
  if (isNaN(sgpa)) return { valid: false, message: 'SGPA must be a number' };
  if (sgpa < 0) return { valid: false, message: 'SGPA cannot be negative' };
  if (sgpa > 10) return { valid: false, message: 'SGPA cannot exceed 10.0' };
  return { valid: true, message: '' };
}

export function validateCGPA(cgpa: number): { valid: boolean; message: string } {
  if (isNaN(cgpa)) return { valid: false, message: 'CGPA must be a number' };
  if (cgpa < 0) return { valid: false, message: 'CGPA cannot be negative' };
  if (cgpa > 10) return { valid: false, message: 'CGPA cannot exceed 10.0' };
  return { valid: true, message: '' };
}

export function validateTargetCGPA(
  target: number,
  current: number
): { valid: boolean; message: string } {
  const cgpaCheck = validateCGPA(target);
  if (!cgpaCheck.valid) return cgpaCheck;
  if (target < current) {
    return { valid: true, message: 'Target is below your current CGPA — you have already achieved this!' };
  }
  return { valid: true, message: '' };
}

export function validateProfileField(
  field: string,
  value: string
): { valid: boolean; message: string } {
  if (!value.trim()) {
    return { valid: false, message: `${field} is required` };
  }
  if (field === 'enrollmentNumber' && value.length < 3) {
    return { valid: false, message: 'Enrollment number must be at least 3 characters' };
  }
  return { valid: true, message: '' };
}
