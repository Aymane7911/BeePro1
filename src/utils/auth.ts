// utils/auth.js
'use client';
import { NextRouter } from "next/router";

export const getUser = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error getting user from localStorage:', error);
    return null;
  }
};

export const isAuthenticated = () => {
  const user = getUser();
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  return !!(user && token);
};

export const logout = () => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  
  // Redirect to home page
  window.location.href = '/';
};

export const requireAuth = (router: NextRouter) => {
  if (!isAuthenticated()) {
    router.push('/');
    return false;
  }
  return true;
};