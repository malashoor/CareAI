/**
 * Calculate age from date of birth
 * @param dob Date of birth in ISO string format
 * @returns Age in years
 */
export const calculateAge = (dob: string): number => {
  const birthDate = new Date(dob);
  const ageDiff = Date.now() - birthDate.getTime();
  return new Date(ageDiff).getUTCFullYear() - 1970;
};

/**
 * Check if a date of birth is valid for registration
 * @param dob Date of birth in ISO string format
 * @returns True if the date is valid and user is 40+ years old
 */
export const isValidDOB = (dob: string): boolean => {
  const age = calculateAge(dob);
  return age >= 40 && age < 120; // Basic sanity check for maximum age
};

/**
 * Check if today is the user's birthday
 * @param dob Date of birth in ISO string format
 * @returns True if today is the user's birthday
 */
export const isBirthday = (dob: string): boolean => {
  const today = new Date();
  const birthDate = new Date(dob);
  return today.getMonth() === birthDate.getMonth() && 
         today.getDate() === birthDate.getDate();
}; 