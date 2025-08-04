import React, { useState } from "react";
import { Card, Input, Button, Select } from "antd";
import {
  Mail,
  Lock,
  Stethoscope,
  UserCheck,
  Shield,
} from "lucide-react";

const { Option } = Select;

const SignupForm = ({ onSignup }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = (e) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      setLoading(false);
      return;
    }

    setTimeout(() => {
      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        role,
        specialty: role === "doctor" ? "General Medicine" : undefined,
      };

      localStorage.setItem("user", JSON.stringify(newUser));
      onSignup(newUser);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card
        title={
          <div className="text-center pt-6">
            <div className="mx-auto mb-4 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold">Create Account</h2>
            <p className="text-sm text-gray-500">Join MedTranscribe securely</p>
          </div>
        }
        className="w-full max-w-md"
      >
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Full Name
            </label>
            <Input
              id="name"
              prefix={<UserCheck size={16} />}
              placeholder="Dr. Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              prefix={<Mail size={16} />}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <Input.Password
              id="password"
              prefix={<Lock size={16} />}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <Input.Password
              id="confirmPassword"
              prefix={<Lock size={16} />}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700"
            >
              Role
            </label>
            <Select
              placeholder="Select your role"
              value={role || undefined}
              onChange={(value) => setRole(value)}
              className="w-full"
            >
              <Option value="doctor">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" />
                  Doctor / Clinician
                </div>
              </Option>
              <Option value="transcriptionist">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  Medical Transcriptionist
                </div>
              </Option>
              <Option value="admin">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Administrator
                </div>
              </Option>
            </Select>
          </div>

          <Button
            type="primary"
            htmlType="submit"
            className="w-full"
            loading={loading}
          >
            Sign Up
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default SignupForm;
