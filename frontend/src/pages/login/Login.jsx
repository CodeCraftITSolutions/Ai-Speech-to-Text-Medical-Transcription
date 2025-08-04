import React, { useState } from "react";
import { Card, Input, Button, Select, Spin } from "antd";
import { Stethoscope, Shield, UserCheck } from "lucide-react";

const { Option } = Select;
const LoginForm = (onLogin) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      const user = {
        id: "1",
        name:
          role === "doctor"
            ? "Dr. Sarah Johnson"
            : role === "transcriptionist"
            ? "Alice Smith"
            : "Admin User",
        email,
        role,
        specialty: role === "doctor" ? "Cardiology" : undefined,
      };

      localStorage.setItem("user", JSON.stringify(user));
      onLogin(user);
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
            <h2 className="text-xl font-bold">MedTranscribe</h2>
            <p className="text-sm text-gray-500">
              Secure Medical Transcription Platform
            </p>
          </div>
        }
        className="w-full max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="doctor@hospital.com"
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            Sign In
          </Button>
        </form>

        {/* <div className="mt-4 text-center text-sm text-gray-600">
          <p>Demo Credentials:</p>
          <p>Email: demo@medtranscribe.com</p>
          <p>Password: demo123</p>
        </div> */}
      </Card>
    </div>
  );
}
export default LoginForm;
