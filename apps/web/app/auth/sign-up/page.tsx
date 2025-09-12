'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { InputField } from '@repo/ui/input-field';
import { trpc } from '../../_trpc/client';
import { TRPCClientError } from '@trpc/client';
import { Button } from '@repo/ui/button';
import { AuthFooter } from '../../components/auth-footer';
import { DemoAccountBox } from '@repo/ui/demo-account-box';
import { TokenManager } from '../../../utils/auth';
import { RedirectIfAuthenticated } from '../../components/require-auth';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);


  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6 && formData.password.length > 0) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Name validation (optional, but if provided, should be reasonable)
    if (formData.name.trim() && formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  const signUpMutation = trpc.signUp.useMutation();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const { accessToken } = await signUpMutation.mutateAsync({
        email: formData.email.trim(),
        password: formData.password,
        ...(formData.name.trim() && { name: formData.name.trim() }),
      });

      // Store access token (refresh token is in HTTP cookie)
      TokenManager.setAccessToken(accessToken);

        router.push('/dashboard/teacher');
    } catch (error) {
      console.log(error);
      if (error instanceof TRPCClientError) {
        setErrors({ general: error.message });
      } else {
        setErrors({ general: 'An unexpected error occurred. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RedirectIfAuthenticated>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12 sm:px-6 lg:px-8">
      {/* BolChaal Logo */}
      <div className="absolute top-6 left-6 z-10">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-sky-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <span className="text-xl font-bold text-gray-900 hidden sm:block">BolChaal</span>
        </Link>
      </div>

      <div className="flex items-center justify-center min-h-[80vh] gap-8 lg:gap-12">
        {/* Auth Form - Centered */}
        <div className="flex-1 max-w-md">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Create Account
              </h2>
              <p className="text-gray-600">
                Join us and start your journey
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {errors.general}
                </div>
              )}

              <div className="space-y-4">
                {/* Name Field - Optional */}
                <div>
                  <InputField
                    id="name"
                    name="name"
                    type="text"
                    label="Full Name (Optional)"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    error={errors.name}
                  />
                </div>

                {/* Email Field - Required */}
                <div>
                  <InputField
                    id="email"
                    name="email"
                    type="email"
                    label="Email Address"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    error={errors.email}
                  />
                </div>

                {/* Password Field - Required */}
                <div>
                  <InputField
                    id="password"
                    name="password"
                    type="password"
                    label="Password"
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Create a strong password"
                    error={errors.password}
                  />

                  {/* Password Strength Indicator */}
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className={`flex-1 h-1 rounded-full transition-colors ${
                        formData.password.length >= 6 ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                      <span className={`text-xs font-medium transition-colors ${
                        formData.password.length >= 6 ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {formData.password.length}/6 characters
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.password.length >= 6 ? (
                        <span className="text-green-600 flex items-center">
                          ✓ Password meets minimum length requirement
                        </span>
                      ) : (
                        <span>Password must be at least 6 characters long</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Confirm Password Field - Required */}
                <div>
                  <InputField
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    label="Confirm Password"
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    error={errors.confirmPassword}
                  />
                </div>
              </div>

              <div>
                <Button type="submit" disabled={isLoading} fullWidth>
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <a href="/auth/sign-in" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                    Sign in here
                  </a>
                </p>
              </div>
            </form>

            {/* Footer with back button and branding */}
            <AuthFooter />
          </div>
        </div>

        {/* Demo Account Box - Side */}
        <div className="flex-shrink-0 w-full max-w-sm order-first lg:order-last">
          <DemoAccountBox />
        </div>
      </div>
    </div>
    </RedirectIfAuthenticated>
  );
}
