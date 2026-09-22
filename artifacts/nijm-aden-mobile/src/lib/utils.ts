import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Resolves asset paths with Vite's BASE_URL for GitHub Pages subpath deployment.
 * Returns Base64 strings (from Admin upload) and external URLs unchanged.
 */
export const resolveImagePath = (path?: string | null): string => {
  if (!path) return '';
  // If it's a Base64 upload (from Admin) or external URL, return as-is:
  if (path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const baseUrl = import.meta.env.BASE_URL || '/';
  if (baseUrl !== '/' && path.startsWith(baseUrl)) {
    return path;
  }
  // Clean leading slash and prepend Vite BASE_URL:
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${normalizedBase}${cleanPath}`;
};
