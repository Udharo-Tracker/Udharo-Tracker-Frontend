import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Alert, Button, Card, Input } from "antd";
import { ShieldCheck, CircleCheck } from "lucide-react";
import { Label } from "@/components/shared/Label";
import { useResetPassword } from "@/api/auth.api";
import { getApiErrorMessage } from "@/api/client";

// uid/token come off the query string of the link mailed to the user
// (?uid=...&token=...) — read them from the URL, don't construct them.
export function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const uid = params.get("uid") ?? "";
  const token = params.get("token") ?? "";
  const resetPassword = useResetPassword();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const passwordsMatch = password === confirmPassword;

  const linkInvalid = !uid || !token;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordsMatch) return;
    resetPassword.mutate({
      uid,
      token,
      password,
      confirm_password: confirmPassword,
    });
  };

  return (
    <div className="min-h-screen grid place-items-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="size-12 rounded-2xl bg-primary-soft grid place-items-center">
            <ShieldCheck className="size-6 text-primary" />
          </div>
          <div>
            <div className="font-semibold text-lg">Reset password</div>
            <div className="text-sm text-muted-foreground">
              Choose a new password for your account
            </div>
          </div>
        </div>

        <Card className="p-6 rounded-3xl border-none shadow-sm">
          {linkInvalid ? (
            <Alert
              type="error"
              showIcon
              title="Invalid reset link"
              description="This link is missing or malformed. Request a new one from the forgot-password page."
            />
          ) : resetPassword.isSuccess ? (
            <div className="text-center space-y-3 py-2">
              <div className="size-12 mx-auto rounded-2xl bg-success-soft grid place-items-center">
                <CircleCheck className="size-6 text-success" />
              </div>
              <p className="text-sm text-muted-foreground">
                Your password has been reset.
              </p>
              <Button
                type="primary"
                block
                size="large"
                className="rounded-xl"
                onClick={() => navigate("/login", { replace: true })}
              >
                Sign in
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              {resetPassword.isError && (
                <Alert
                  type="error"
                  showIcon
                  description={getApiErrorMessage(
                    resetPassword.error,
                    "Couldn't reset password",
                  )}
                />
              )}
              <div>
                <Label className="mb-2 block">New password</Label>
                <Input.Password
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoFocus
                  required
                  className="h-11 rounded-xl"
                />
              </div>
              <div>
                <Label className="mb-2 block">Confirm new password</Label>
                <Input.Password
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  status={
                    confirmPassword && !passwordsMatch ? "error" : undefined
                  }
                  className="h-11 rounded-xl"
                />
                {confirmPassword && !passwordsMatch && (
                  <div className="mt-1.5 text-xs text-danger">
                    Passwords don't match.
                  </div>
                )}
              </div>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={resetPassword.isPending}
                disabled={!password || !passwordsMatch}
                className="rounded-xl"
              >
                Reset password
              </Button>
            </form>
          )}
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          <Link
            to="/login"
            className="text-primary font-medium hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
