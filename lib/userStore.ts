
let userEmail: string | null = null;

const isClient = typeof window !== 'undefined';

export const setUserEmail = (email: string) => {
  userEmail = email;
  if (isClient) {
    localStorage.setItem('userEmail', email);
  }
};

export const getUserEmail = (): string | null => {
  if (isClient && userEmail === null) {
    userEmail = localStorage.getItem('userEmail');
  }
  return userEmail;
};

export const clearUserEmail = () => {
  userEmail = null;
  if (isClient) {
    localStorage.removeItem('userEmail');
  }
};

// Initialize userEmail from localStorage if available
if (isClient) {
  userEmail = localStorage.getItem('userEmail');
}