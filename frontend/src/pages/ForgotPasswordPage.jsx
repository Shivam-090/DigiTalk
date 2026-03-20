import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";
import { ShipWheelIcon } from "lucide-react";
import toast from "react-hot-toast";
import { forgotPassword } from "../lib/api";
import { hasErrors, validateForgotPasswordForm } from "../lib/validation";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const { mutate, isPending, error } = useMutation({
    mutationFn: forgotPassword,
    onSuccess: (data) => {
      toast.success(data.message);
      navigate("/login");
    },
  });

  const updateField = (field, value) => {
    const nextData = { ...formData, [field]: value };
    setFormData(nextData);

    const nextErrors = validateForgotPasswordForm(nextData);
    setErrors((current) => ({
      ...current,
      [field]: nextErrors[field],
      ...(field === "password" || field === "confirmPassword"
        ? { confirmPassword: nextErrors.confirmPassword }
        : {}),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = validateForgotPasswordForm(formData);
    setErrors(nextErrors);

    if (hasErrors(nextErrors)) {
      return;
    }

    mutate(formData);
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
              <span>{error.response?.data?.message || "Unable to reset password"}</span>
            </div>
          )}

          <div className="w-full">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">Forgot Password</h2>
                <p className="text-sm opacity-70">
                  Enter your registered email and set a new password.
                </p>
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
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    onBlur={(e) => updateField("email", e.target.value)}
                    required
                  />
                  {errors.email && <p className="text-sm text-error">{errors.email}</p>}
                </div>

                <div className="form-control w-full space-y-2">
                  <label className="label">
                    <span className="label-text">New Password</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your new password"
                    className={`input input-bordered w-full ${errors.password ? "input-error" : ""}`}
                    value={formData.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    onBlur={(e) => updateField("password", e.target.value)}
                    required
                  />
                  {errors.password && <p className="text-sm text-error">{errors.password}</p>}
                </div>

                <div className="form-control w-full space-y-2">
                  <label className="label">
                    <span className="label-text">Confirm Password</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Confirm your new password"
                    className={`input input-bordered w-full ${errors.confirmPassword ? "input-error" : ""}`}
                    value={formData.confirmPassword}
                    onChange={(e) => updateField("confirmPassword", e.target.value)}
                    onBlur={(e) => updateField("confirmPassword", e.target.value)}
                    required
                  />
                  {errors.confirmPassword && <p className="text-sm text-error">{errors.confirmPassword}</p>}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </button>

                <div className="text-center mt-4">
                  <p className="text-sm">
                    Remembered your password?{" "}
                    <Link to="/login" className="text-primary hover:underline">
                      Back to sign in
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
                Get back into your conversations quickly
              </h2>
              <p className="opacity-70">
                Reset your password and continue chatting with your language
                partners.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
