import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes safely — resolves conflicts like clsx + twMerge. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
