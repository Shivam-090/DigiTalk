const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernameRegex = /^[a-z0-9_]{3,20}$/;
const imageUrlRegex = /^https?:\/\//i;
const base64ImageRegex = /^data:image\/[a-zA-Z0-9.+-]+;base64,/i;

const trim = (value = "") => value.trim();

export const validateEmail = (email) => {
  const value = trim(email).toLowerCase();

  if (!value) return "Email is required";
  if (!emailRegex.test(value)) return "Invalid email format";
  return "";
};

export const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < 6) return "Password must be at least 6 characters";
  return "";
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return "Please confirm your password";
  if (password !== confirmPassword) return "Passwords do not match";
  return "";
};

export const validateFullName = (fullName) => {
  const value = trim(fullName);

  if (!value) return "Full name is required";
  if (value.length < 2 || value.length > 50) return "Full name must be between 2 and 50 characters";
  return "";
};

export const validateUsername = (username) => {
  const value = trim(username).toLowerCase();

  if (!value) return "Username is required";
  if (!usernameRegex.test(value)) {
    return "Username must be 3-20 characters and use only letters, numbers, and underscores";
  }
  return "";
};

export const validateBio = (bio) => {
  const value = trim(bio);

  if (!value) return "Bio is required";
  if (value.length < 10 || value.length > 300) return "Bio must be between 10 and 300 characters";
  return "";
};

export const validateLanguage = (value, fieldLabel) => {
  if (!trim(value)) return `${fieldLabel} is required`;
  return "";
};

export const validateLocation = (location) => {
  const value = trim(location);

  if (!value) return "Location is required";
  if (value.length < 2 || value.length > 80) return "Location must be between 2 and 80 characters";
  return "";
};

export const validateProfilePic = (profilePic) => {
  const value = trim(profilePic);

  if (!value) return "";
  if (!imageUrlRegex.test(value) && !base64ImageRegex.test(value)) {
    return "Profile image must be a valid image URL or image data";
  }
  return "";
};

export const validateSignupForm = (formData) => ({
  fullName: validateFullName(formData.fullName),
  username: validateUsername(formData.username),
  email: validateEmail(formData.email),
  password: validatePassword(formData.password),
});

export const validateLoginForm = (formData) => ({
  email: validateEmail(formData.email),
  password: validatePassword(formData.password),
});

export const validateForgotPasswordForm = (formData) => ({
  email: validateEmail(formData.email),
  password: validatePassword(formData.password),
  confirmPassword: validateConfirmPassword(formData.password, formData.confirmPassword),
});

export const validateProfileForm = (formData) => ({
  fullName: validateFullName(formData.fullName),
  username: validateUsername(formData.username),
  bio: validateBio(formData.bio),
  nativeLanguage: validateLanguage(formData.nativeLanguage, "Native language"),
  learningLanguage: validateLanguage(formData.learningLanguage, "Learning language"),
  location: validateLocation(formData.location),
  profilePic: validateProfilePic(formData.profilePic),
});

export const hasErrors = (errors) => Object.values(errors).some(Boolean);
