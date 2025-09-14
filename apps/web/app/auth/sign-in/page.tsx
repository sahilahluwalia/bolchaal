'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { InputField } from '@repo/ui/input-field';
import { Button } from '@repo/ui/button';
import { AuthFooter } from '../../components/auth-footer';
import { DemoAccountBox } from '../../components/demo-account-box';
import { trpc } from '../../_trpc/client';
import { TRPCClientError } from '@trpc/client';
import { TokenManager } from '../../../utils/auth';
import { RedirectIfAuthenticated } from '../../components/require-auth';

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function SignInPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const signInMutation = trpc.signIn.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const { accessToken, role } = await signInMutation.mutateAsync({
        email: formData.email.trim(),
        password: formData.password,
      });

      // Store access token (refresh token is in HTTP cookie)
      TokenManager.setAccessToken(accessToken);

      if(role === 'TEACHER'){
        router.push('/dashboard/teacher');
      }else{
        router.push('/dashboard/student');
      }

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
                Welcome back
              </h2>
              <p className="text-gray-600">
                Sign in to continue
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {errors.general}
                </div>
              )}

              <div className="space-y-4">
                <InputField
                  id="email"
                  name="email"
                  label="Email Address"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  error={errors.email}
                />

                <InputField
                  id="password"
                  name="password"
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  error={errors.password}
                />
              </div>

              <div>
                <Button type="submit" disabled={isLoading} fullWidth>
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don&apos;t have an account?{' '}
                  <a href="/auth/sign-up" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                    Create one
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
