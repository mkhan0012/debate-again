'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { createSession, deleteSession } from '@/lib/session'
import { redirect } from 'next/navigation'

// --- 1. Define Standard State Type (Fixes TypeScript Build Error) ---
export type AuthState = {
  errors?: {
    username?: string[];
    email?: string[];
    password?: string[];
    form?: string; // Used for general errors (login failed, db error)
  };
  message?: string; // Used for global success/error messages
}

// --- Validation Schemas ---
const SignupSchema = z.object({
  username: z.string().min(2, { message: 'Username must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
})

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

// --- Sign Up Action ---
export async function signup(prevState: AuthState | undefined, formData: FormData): Promise<AuthState> {
  // 1. Validate Form Data
  const result = SignupSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  const { email, password, username } = result.data;

  try {
    // 2. Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      },
    })

    if (existingUser) {
      return {
        errors: {
          email: ['User with this email or username already exists.'],
        },
      }
    }

    // 3. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10)

    // 4. Create User in DB (FIXED: Uses 'username' column)
    const user = await prisma.user.create({
      data: {
        username: username, // <--- Correctly maps to the database column
        email,
        password: hashedPassword,
      },
    })

    // 5. Create Session
    await createSession(user.id)
    
  } catch (error) {
    console.error('Signup error:', error)
    return {
      message: 'Database Error: Failed to create user. Please try again.',
    }
  }

  // 6. Redirect to Profile
  redirect('/profile')
}

// --- Login Action ---
export async function login(prevState: AuthState | undefined, formData: FormData): Promise<AuthState> {
  // 1. Validate Form Data
  const result = LoginSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return { errors: { form: 'Invalid email or password format.' } };
  }

  const { email, password } = result.data;

  try {
    // 2. Find User
    const user = await prisma.user.findUnique({ 
      where: { email } 
    });
    
    // 3. Verify Password
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return { errors: { form: 'Invalid email or password.' } };
    }

    // 4. Create Session
    await createSession(user.id);

  } catch (error) {
    console.error('Login Error:', error);
    return { errors: { form: 'Something went wrong. Please try again.' } };
  }

  // 5. Redirect to Profile
  redirect('/profile');
}

// --- Logout Action ---
export async function logout() {
  await deleteSession();
  redirect('/login');
}