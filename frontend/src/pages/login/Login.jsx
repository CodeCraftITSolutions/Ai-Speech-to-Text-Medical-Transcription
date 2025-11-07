import React, { useEffect, useState } from "react";
import { Card, Input, Button, message } from "antd";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Stethoscope } from "lucide-react";
import { useUser } from "../../context/UserContext.jsx";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [needsTotp, setNeedsTotp] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const navigate = useNavigate();
  const { login, isAuthenticated } = useUser();

  useEffect(() => {
    setNeedsTotp(false);
    setTotpCode("");
  }, [username]);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(username, password, needsTotp ? totpCode : undefined);
      message.success("Logged in successfully");
      navigate("/dashboard");
    } catch (error) {
        const totpRequired =
        error?.body?.totp_required || error?.body?.detail?.totp_required;
        if (totpRequired) {
          setNeedsTotp(true);
          setTotpCode("");
          message.info(
            error?.message || "Enter the 6-digit code from your authenticator app."
          );
          return;
      }
      message.error(error?.message ?? "Unable to login");
    } finally {
      setSubmitting(false);
    }
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
            <p className="text-sm text-gray-500">Secure Medical Transcription Platform</p>
          </div>
        }
        className="w-full max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <Input
              id="username"
              placeholder="doctor@hospital.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
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

          {needsTotp && (
            <div className="space-y-1">
              <label htmlFor="totp" className="block text-sm font-medium text-gray-700">
                Authentication Code
              </label>
              <Input
                id="totp"
                placeholder="123456"
                value={totpCode}
                maxLength={8}
                inputMode="numeric"
                pattern="\d*"
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                required
              />
              <p className="text-xs text-gray-500">
                Enter the 6-digit code from your authenticator app.
              </p>
            </div>
          )}

          <Button type="primary" htmlType="submit" className="w-full" loading={submitting}>
            Sign In
          </Button>
          <div className="flex flex-col items-center gap-2 text-sm text-gray-600">
            <p>
              Forgot my password?{" "}
              <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                Reset password
              </Link>
            </p>
            <p>
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
};
export default LoginForm;
