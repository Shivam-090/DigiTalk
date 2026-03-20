export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const usernameRegex = /^[a-z0-9_]{3,20}$/;
const imageUrlRegex = /^https?:\/\//i;
const base64ImageRegex = /^data:image\/[a-zA-Z0-9.+-]+;base64,/i;

export const normalizeEmail = (value = "") => value.trim().toLowerCase();
export const normalizeUsername = (value = "") => value.trim().toLowerCase();
export const normalizeText = (value = "") => value.trim();

const hasValue = (value) => typeof value === "string" && value.trim().length > 0;

export function validateEmail(email) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return { valid: false, message: "Email is required" };
  }

  if (!emailRegex.test(normalizedEmail)) {
    return { valid: false, message: "Invalid email format" };
  }

  return { valid: true, value: normalizedEmail };
}

export function validatePassword(password, { required = true, confirmPassword } = {}) {
  if (!password) {
    return required ? { valid: false, message: "Password is required" } : { valid: true, value: "" };
  }

  if (password.length < 6) {
    return { valid: false, message: "Password must be at least 6 characters" };
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    return { valid: false, message: "Passwords do not match" };
  }

  return { valid: true, value: password };
}

export function validateFullName(fullName) {
  const normalizedFullName = normalizeText(fullName);

  if (!normalizedFullName) {
    return { valid: false, message: "Full name is required" };
  }

  if (normalizedFullName.length < 2 || normalizedFullName.length > 50) {
    return { valid: false, message: "Full name must be between 2 and 50 characters" };
  }

  return { valid: true, value: normalizedFullName };
}

export function validateUsername(username) {
  const normalizedUsername = normalizeUsername(username);

  if (!normalizedUsername) {
    return { valid: false, message: "Username is required" };
  }

  if (!usernameRegex.test(normalizedUsername)) {
    return {
      valid: false,
      message: "Username must be 3-20 characters and use only letters, numbers, and underscores",
    };
  }

  return { valid: true, value: normalizedUsername };
}

export function validateBio(bio) {
  const normalizedBio = normalizeText(bio);

  if (!normalizedBio) {
    return { valid: false, message: "Bio is required" };
  }

  if (normalizedBio.length < 10 || normalizedBio.length > 300) {
    return { valid: false, message: "Bio must be between 10 and 300 characters" };
  }

  return { valid: true, value: normalizedBio };
}

export function validateLanguage(value, fieldLabel) {
  const normalizedValue = normalizeText(value);

  if (!normalizedValue) {
    return { valid: false, message: `${fieldLabel} is required` };
  }

  if (normalizedValue.length < 2 || normalizedValue.length > 40) {
    return { valid: false, message: `${fieldLabel} must be between 2 and 40 characters` };
  }

  return { valid: true, value: normalizedValue.toLowerCase() };
}

export function validateLocation(location) {
  const normalizedLocation = normalizeText(location);

  if (!normalizedLocation) {
    return { valid: false, message: "Location is required" };
  }

  if (normalizedLocation.length < 2 || normalizedLocation.length > 80) {
    return { valid: false, message: "Location must be between 2 and 80 characters" };
  }

  return { valid: true, value: normalizedLocation };
}

export function validateProfilePic(profilePic) {
  if (profilePic === undefined || profilePic === null || profilePic === "") {
    return { valid: true, value: undefined };
  }

  if (typeof profilePic !== "string") {
    return { valid: false, message: "Profile image must be a valid image URL or image data" };
  }

  const normalizedProfilePic = profilePic.trim();

  if (!normalizedProfilePic) {
    return { valid: true, value: "" };
  }

  if (!imageUrlRegex.test(normalizedProfilePic) && !base64ImageRegex.test(normalizedProfilePic)) {
    return { valid: false, message: "Profile image must be a valid image URL or image data" };
  }

  return { valid: true, value: normalizedProfilePic };
}

export function getMissingProfileFields(payload = {}) {
  return [
    !hasValue(payload.fullName) && "fullName",
    !hasValue(payload.username) && "username",
    !hasValue(payload.bio) && "bio",
    !hasValue(payload.nativeLanguage) && "nativeLanguage",
    !hasValue(payload.learningLanguage) && "learningLanguage",
    !hasValue(payload.location) && "location",
  ].filter(Boolean);
}
