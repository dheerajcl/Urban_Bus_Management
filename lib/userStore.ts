// lib/userStore.ts

let userEmail: string | null = null;

export const setUserEmail = (email: string) => {
  userEmail = email;
};

export const getUserEmail = () => userEmail;