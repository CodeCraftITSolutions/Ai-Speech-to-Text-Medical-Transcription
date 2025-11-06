import React, { useState } from "react";
import { Card, Input, Button, Alert } from "antd";
import { Link } from "react-router-dom";
import { MailCheck, Undo2 } from "lucide-react";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    // Simulated API request for password reset
    setTimeout(() => {
      setStatus({
        type: "success",
        message:
          "If an account exists for this email, reset instructions have been sent.",
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-lg">
        <div className="text-center space-y-3">
          <div className="mx-auto mb-2 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <MailCheck className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Reset your password</h1>
          <p className="text-sm text-gray-600">
            Enter the email address associated with your account and we&apos;ll send you
            instructions to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@hospital.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <Button type="primary" htmlType="submit" className="w-full" loading={loading}>
            Send reset link
          </Button>
        </form>

        {status && (
          <Alert type={status.type} message={status.message} className="mt-6" showIcon />
        )}

        <div className="mt-8 text-center text-sm text-gray-600">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 font-medium text-blue-600 hover:text-blue-500"
          >
            <Undo2 className="w-4 h-4" />
            Back to login
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default ResetPassword;
