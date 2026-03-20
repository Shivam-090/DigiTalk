import React, { useState } from "react";
import { ShipWheel } from "lucide-react";
import { Link } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signup } from "../lib/api";

const SignupPage = () => {
  const [signupData, setSignupData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });

  const queryClient = useQueryClient();

  const {mutate:signupMutation, isPending, error} = useMutation({
   mutationFn: signup,
    onSuccess: ()=> queryClient.invalidateQueries({ queryKey: ["authUser"] }),
  })

  const handleSignup = (e) => {
    e.preventDefault();
    signupMutation(signupData);
  };

  return (
    <div
      className="h-screen flex items-center justify-center p-4 sm:p-6 md:p-8" data-theme="forest"
    >
      <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-bage-100 rounded-xl shadow-lg overflow-hidden">
        {/* LEFT SIDE */}
        <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
          <div className="mb-4 flex items-center justify-start gap-2">
            <ShipWheel className="w-10 h-10 text-primary" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary tracking-wider">
              DigiTalk
            </span>
          </div>

          {/* Error message */}
          {error && (
            <div className="alert alert-error mb-4">
              <span>{error.response.data.message}</span>
            </div>
          )}

          <div className="w-full">
            <form onSubmit={handleSignup}>
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">Create an Account</h2>
                  <p className="text-sm opacity-70">
                    Join DigiTalk and start your language learning adventure!
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Full Name</span>
                    </label>
                    <input type="text" placeholder="Full Name" className="input input-bordered w-full" value={signupData.fullName} onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value})} required />
                  </div>

                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Email</span>
                    </label>
                    <input type="text" placeholder="Example@gmail.com" className="input input-bordered w-full" value={signupData.email} onChange={(e) => setSignupData({ ...signupData, email: e.target.value})} required />
                  </div>

                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Username</span>
                    </label>
                    <input type="text" placeholder="username_123" className="input input-bordered w-full" value={signupData.username} onChange={(e) => setSignupData({ ...signupData, username: e.target.value.toLowerCase()})} required />
                    <p className="mt-1 text-xs opacity-70">
                      Use 3-20 letters, numbers, or underscores. This must be unique.
                    </p>
                  </div>
                  
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Password</span>
                    </label>
                    <input type="Password" placeholder="Enter your password" className="input input-bordered w-full" value={signupData.password} onChange={(e) => setSignupData({ ...signupData, password: e.target.value})} required />
                  </div>

                  <div className="form-control w-full">
                    <label className="label cursor-pointer justify-start gap-2">
                      <input type="checkbox" className="checkbox checkbox-sm" required />
                      <span className="text-xs leading-tight">I agree to the {" "}</span>
                      <span className="text-primary hover:underline">terms of service</span> and{" "}
                      <span className="text-primary hover:underline">privacy policy</span>
                    </label>
                  </div>
                </div>

                <button className="btn btn-primary w-full" type="submit">{isPending ? (
                  <>
                <span className="loading loading-spinner loading-xs">Loading...</span>
                </>
              ) : (
              "Create Account")}</button>

                <div className="text-center mt-4">
                  <p className="tetx-sm">
                    Already have an account? {" "}
                    <Link to="login" className="text-primary hover:underline">Sign in</Link>
                  </p>
                </div>

              </div>
            </form>

          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
        <div className="max-w-md p-8">
          <div className="relative aspect-square max-w-sx mx-auto">
            <img src="/signup.png" alt="Language connection illustration" className="w-full h-full" />
          </div>

          <div className="text-center space-y-3 mt-6">
            <h2 className="text-xl font-semibold">Connect with language partners worldwide</h2>
            <p className="opacity-70">Practice conversations, make friends, and improce your language skills together</p>

          </div>

        </div>

        </div>
      </div>
    </div>
  );
};

export default SignupPage;
