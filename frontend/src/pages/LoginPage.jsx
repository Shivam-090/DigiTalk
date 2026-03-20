import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { login } from "../lib/api";
import { ShipWheelIcon } from "lucide-react";
import { Link } from "react-router";
import { hasErrors, validateLoginForm } from "../lib/validation";

const LoginPage = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const queryClient = useQueryClient();

  const {
    mutate: loginMutation,
    isPending,
    error,
  } = useMutation({
    mutationFn: login,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
  });

  const updateField = (field, value) => {
    const nextData = { ...loginData, [field]: value };
    setLoginData(nextData);

    const nextErrors = validateLoginForm(nextData);
    setErrors((current) => ({ ...current, [field]: nextErrors[field] }));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const nextErrors = validateLoginForm(loginData);
    setErrors(nextErrors);

    if (hasErrors(nextErrors)) {
      return;
    }

    loginMutation(loginData);
  };

  return (
    <div
      className="h-screen flex items-center justify-center p-4 sm:p-6 md:p-8"
      data-theme="forest"
    >
      <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">
        <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
          <div className="mb-4 flex items-center justify-start gap-2">
            <ShipWheelIcon className="size-9 text-primary" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary tracking-wider">
              DigiTalk
            </span>
            </div>

            {error && (
              <div className="alert alert-error mb-4">
                <span>{error.response.data.message}</span>
              </div>
            )}

            <div className="w-full">
              <form onSubmit={handleLogin}>
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold">Welcome Back</h2>
                    <p className="text-sm opacity-70">
                      Sign in to your account to continue your language journey
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="form-control w-full space-y-2">
                    <label className="label">
                      <span className="label-text">Email</span>
                    </label>
                    <input
                      type="email"
                      placeholder="hello@example.com"
                      className={`input input-bordered w-full ${errors.email ? "input-error" : ""}`}
                      value={loginData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      onBlur={(e) => updateField("email", e.target.value)}
                      required
                    />
                    {errors.email && <p className="text-sm text-error">{errors.email}</p>}
                  </div>

                  <div className="form-control w-full space-y-2">
                    <label className="label">
                      <span className="label-text">Password</span>
                    </label>
                    <input
                      type="password"
                      placeholder="**********"
                      className={`input input-bordered w-full ${errors.password ? "input-error" : ""}`}
                      value={loginData.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      onBlur={(e) => updateField("password", e.target.value)}
                      required
                    />
                    {errors.password && <p className="text-sm text-error">{errors.password}</p>}
                  </div>

                  <div className="text-right">
                    <Link
                      to="/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-full"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <span className="loading loading-spinner loading-xs"></span>
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </button>

                  <div className="text-center mt-4">
                    <p className="text-sm">
                      Don't have an account?{" "}
                      <Link
                        to="/signup"
                        className="text-primary hover:underline"
                      >
                        Create one
                      </Link>
                    </p>
                  </div>
                </div>
              </form>
            </div>

    </div>
          <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
            <div className="max-w-md p-8">
              <div className="relative aspect-square max-w-sm mx-auto">
                <img src="/signup.png" alt="" className="w-full h-full" />
              </div>

              <div className="text-center space-y-3 mt-6">
                <h2 className="text-xl font-semibold">
                  Connect with language partners worldwide
                </h2>
                <p className="opacity-70">
                  Practice conversations, make friends, and improve your
                  language skills together
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default LoginPage;
