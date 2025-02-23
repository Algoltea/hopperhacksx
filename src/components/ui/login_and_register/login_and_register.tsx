"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loading";
import { loginUser, registerUser } from "@/lib/auth/auth";
import { FirebaseError } from "firebase/app";

export default function DemoAuthForm() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!email || !password) {
      setError("Email and password are required.");
      setIsLoading(false);
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await loginUser(email, password);
        router.push('/dashboard');
      } else {
        await registerUser(email, password);
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      const error = err as FirebaseError;
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleForm = () => {
    setIsLogin((prev) => !prev);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError(null);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#f4f0e5]">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="shadow-2xl p-6 w-[350px] rounded-2xl bg-white/80">
          <CardContent>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              {isLogin ? "Login" : "Register"}
            </h2>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
              <div>
                <Label htmlFor="email" className="text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="mt-1"
                  disabled={isLoading}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="mt-1"
                  disabled={isLoading}
                  required
                />
              </div>
              {!isLogin && (
                <div>
                  <Label htmlFor="confirmPassword" className="text-gray-700">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="mt-1"
                    disabled={isLoading}
                    required
                  />
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full mt-2"
                disabled={isLoading}
              >
                {isLoading ? <Loader size="sm" /> : isLogin ? "Login" : "Sign Up"}
              </Button>
            </form>
            <div className="text-center mt-4">
              <p className="text-sm">
                {isLogin ? "Need an account?" : "Already have an account?"}{" "}
                <button 
                  className="hover:underline" 
                  onClick={toggleForm}
                  disabled={isLoading}
                >
                  {isLogin ? "Register now" : "Log in"}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}