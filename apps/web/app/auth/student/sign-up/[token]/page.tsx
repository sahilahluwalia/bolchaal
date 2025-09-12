"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "../../../../_trpc/client";
import { TRPCClientError } from "@trpc/client";
import { Button } from "@repo/ui/button";
import { InputField } from "@repo/ui/input-field";
import { TokenManager } from "../../../../../utils/auth";
import Loader from "../../../../components/loader";

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

export default function StudentInviteSignUpPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const { data: invite, isLoading: inviteLoading } =
    trpc.getInvitationDetails.useQuery({ token }, { enabled: !!token });
  const signUpMutation = trpc.studentSignUpWithInvitation.useMutation();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters long";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});

    try {
      const { accessToken } = await signUpMutation.mutateAsync({
        token,
        email: formData.email.trim(),
        password: formData.password,
        name: formData.name.trim(),
      });
      TokenManager.setAccessToken(accessToken);
      router.push("/dashboard/student");
    } catch (error) {
      if (error instanceof TRPCClientError) {
        setErrors({ general: error.message });
      } else {
        setErrors({
          general: "An unexpected error occurred. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const heroTitle = useMemo(() => {
    if (!inviteLoading && !invite?.valid)
      return "Invalid or expired invitation";
    return invite?.teacher?.name && `Join ${invite.teacher.name}'s class`;
  }, [inviteLoading, invite]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute top-6 left-6 z-10">
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-sky-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <span className="text-xl font-bold text-gray-900 hidden sm:block">
            BolChaal
          </span>
        </Link>
      </div>

      <div className="flex items-center justify-center min-h-[80vh] gap-8 lg:gap-12">
        <div className="flex-1 max-w-md">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {heroTitle}
              </h2>
              {invite?.classroom && (
                <p className="text-gray-600">
                  Classroom:{" "}
                  <span className="font-medium">{invite.classroom.name}</span>
                </p>
              )}
            </div>

            {inviteLoading ? (
              <div className="text-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Verifying invitation…
                </h2>
                <p className="text-gray-600 text-sm">
                  Please wait while we check your invite link.
                </p>
                <Loader />
              </div>
            ) : (
              <>
                {!invite?.valid ? (
                  <div className="mt-8 space-y-4 text-center">
                    <p className="text-gray-600">
                      This invitation is not valid. Please request a new link
                      from your teacher.
                    </p>
                    <Link href="/">
                      <Button variant="outline">Go Home</Button>
                    </Link>
                  </div>
                ) : (
                  <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {errors.general && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                        {errors.general}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <InputField
                          id="name"
                          name="name"
                          label="Full Name"
                          required
                          autoComplete="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          error={errors.name}
                        />
                      </div>

                      <div>
                        <InputField
                          id="email"
                          name="email"
                          type="email"
                          label="Email Address"
                          required
                          autoComplete="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter your email address"
                          error={errors.email}
                        />
                      </div>

                      <div>
                        <InputField
                          id="password"
                          name="password"
                          type="password"
                          label="Password"
                          required
                          autoComplete="new-password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Create a strong password"
                          error={errors.password}
                        />
                        <div className="mt-2">
                          <div className="flex items-center space-x-2">
                            <div
                              className={`flex-1 h-1 rounded-full transition-colors ${
                                formData.password.length >= 6
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                            ></div>
                            <span
                              className={`text-xs font-medium transition-colors ${
                                formData.password.length >= 6
                                  ? "text-green-600"
                                  : "text-gray-500"
                              }`}
                            >
                              {formData.password.length}/6 characters
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <InputField
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          label="Confirm Password"
                          required
                          autoComplete="new-password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="Confirm your password"
                          error={errors.confirmPassword}
                        />
                      </div>
                    </div>

                    <div>
                      <Button type="submit" disabled={isLoading} fullWidth>
                        {isLoading ? "Creating Account..." : "Create Account"}
                      </Button>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        Already have an account?{" "}
                        <a
                          href="/auth/sign-in"
                          className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                        >
                          Sign in here
                        </a>
                      </p>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
