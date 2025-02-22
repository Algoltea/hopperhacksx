"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { loginUser, registerUser } from "@/lib/auth/auth";

export default function DemoAuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Reset error state

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      if (isLogin) {
        await loginUser(email, password);
        alert("Login successful!"); // Replace with proper navigation logic
      } else {
        await registerUser(email, password);
        alert("Account created successfully!"); // Replace with navigation logic
      }
    } catch (err: any) {
      setError(err.message);
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
            {error && <p className="text-red-500 text-sm">{error}</p>}
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
                    required
                  />
                </div>
              )}

              <Button type="submit" className="w-full mt-2 bg-slate-600 hover:bg-slate-700 text-white">
                {isLogin ? "Login" : "Sign Up"}
              </Button>
            </form>
            <div className="text-center mt-4">
              <p className="text-sm text-gray-700">
                {isLogin ? "Need an account?" : "Already have an account?"}{" "}
                <button className="text-slate-600 hover:underline" onClick={toggleForm}>
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