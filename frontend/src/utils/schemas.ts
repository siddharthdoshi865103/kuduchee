import { z } from 'zod/v4';

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(150, 'Username must be at most 150 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed'),
  email: z.email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone_number: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[0-9]{10}$/.test(val),
      'Phone number must be 10 digits'
    ),
});
export type RegisterFormData = z.infer<typeof registerSchema>;

export const profileSchema = z.object({
  first_name: z.string().max(150).optional(),
  last_name: z.string().max(150).optional(),
  email: z.email('Please enter a valid email address'),
  phone_number: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[0-9]{10}$/.test(val),
      'Phone number must be 10 digits'
    ),
});
export type ProfileFormData = z.infer<typeof profileSchema>;

export const addressSchema = z.object({
  full_name: z.string().optional(),
  phone: z.string().optional(),
  street_address: z.string().min(1, 'Street address is required'),
  apartment: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postal_code: z
    .string()
    .min(1, 'Postal code is required')
    .regex(/^[0-9]{6}$/, 'Postal code must be 6 digits'),
  is_default: z.boolean().optional(),
});
export type AddressFormData = z.infer<typeof addressSchema>;
