import React, { useState } from "react";
import { Card, Input, Button, message, Alert } from "antd";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Stethoscope } from "lucide-react";
import { useUser } from "../../context/UserContext.jsx";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [twoFactorChallenge, setTwoFactorChallenge] = useState(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [pendingCredentials, setPendingCredentials] = useState(null);
  const navigate = useNavigate();
  const { login, isAuthenticated, completeTwoFactorLogin } = useUser();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const resetTwoFactorState = () => {
    setTwoFactorChallenge(null);
    setTwoFactorCode("");
    setPendingCredentials(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await login(username, password);
      if (result?.requiresTwoFactor) {
        setPendingCredentials({ username, password });
        setTwoFactorChallenge(result);
        setTwoFactorCode("");
        message.info("Open your authenticator app to retrieve your security code.");
        return;
      }
      resetTwoFactorState();
      message.success("Logged in successfully");
      navigate("/dashboard");
    } catch (error) {
      message.error(error?.message ?? "Unable to login");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyTwoFactor = async (e) => {
    e.preventDefault();
    if (!twoFactorChallenge) {
      return;
    }
    const trimmed = twoFactorCode.trim();
    if (trimmed.length < 4) {
      message.error("Enter the 6-digit code from your authenticator app.");
      return;
    }

    setSubmitting(true);
    try {
      await completeTwoFactorLogin(twoFactorChallenge.challengeId, trimmed);
      resetTwoFactorState();
      message.success("Logged in successfully");
      navigate("/dashboard");
    } catch (error) {
      message.error(error?.message ?? "Invalid verification code");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefreshChallenge = async () => {
    if (!pendingCredentials) {
      return;
    }
    setSubmitting(true);
    try {
      const result = await login(pendingCredentials.username, pendingCredentials.password);
      if (result?.requiresTwoFactor) {
        setTwoFactorChallenge(result);
        setTwoFactorCode("");
        message.success("Login challenge refreshed. Use a new authenticator code.");
        return;
      }
      resetTwoFactorState();
      message.success("Logged in successfully");
      navigate("/dashboard");
    } catch (error) {
      message.error(error?.message ?? "Unable to refresh login challenge");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCodeChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 6);
    setTwoFactorCode(digitsOnly);
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
        {!twoFactorChallenge ? (
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
                disabled={submitting}
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
                disabled={submitting}
              />
            </div>

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
        ) : (
          <form onSubmit={handleVerifyTwoFactor} className="space-y-4">
            <Alert
              type="info"
              showIcon
              message="Enter the 6-digit code generated by your authenticator app."
            />
            {twoFactorChallenge.debugCode ? (
              <Alert
                type="warning"
                showIcon
                message={`Development code: ${twoFactorChallenge.debugCode}`}
              />
            ) : null}

            <div className="space-y-1">
              <label htmlFor="twoFactorCode" className="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <Input
                id="twoFactorCode"
                placeholder="123456"
                value={twoFactorCode}
                onChange={handleCodeChange}
                inputMode="numeric"
                maxLength={6}
                disabled={submitting}
              />
            </div>

            <Button type="primary" htmlType="submit" className="w-full" loading={submitting}>
              Verify &amp; Sign In
            </Button>
            <Button
              type="default"
              className="w-full"
              onClick={handleRefreshChallenge}
              disabled={submitting || !pendingCredentials}
            >
              Refresh challenge
            </Button>
            <Button type="link" onClick={resetTwoFactorState} disabled={submitting}>
              Use a different account
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
};
export default LoginForm;
