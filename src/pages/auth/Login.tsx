import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Button, Card, Input, Modal } from "antd";
import { Store } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/shared/Label";
import { useAuth } from "@/hooks/use-auth";
import { useLogin, useResendVerificationEmail } from "@/api/auth.api";

type LocationState = { from?: { pathname: string } };

export function Login() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const login = useLogin();
  const resendVerification = useResendVerificationEmail();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resendOpen, setResendOpen] = useState(false);
  const [resendEmail, setResendEmail] = useState("");

  if (isAuthenticated) {
    const redirectTo =
      (location.state as LocationState | null)?.from?.pathname ?? "/";
    return <Navigate to={redirectTo} replace />;
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(
      { email, password },
      {
        onSuccess: () => {
          const redirectTo =
            (location.state as LocationState | null)?.from?.pathname ?? "/";
          navigate(redirectTo, { replace: true });
        },
        onError: () => {
          toast.error("Login failed", {
            description: "Check your email and password and try again.",
          });
        },
      },
    );
  };

  return (
    <div className="min-h-screen grid place-items-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="size-12 rounded-2xl bg-primary-soft grid place-items-center">
            <Store className="size-6 text-primary" />
          </div>
          <div>
            <div className="font-semibold text-lg">UdharoTrack</div>
            <div className="text-sm text-muted-foreground">
              Sign in to manage your shop credit
            </div>
          </div>
        </div>

        <Card className="p-6 rounded-3xl border-none shadow-sm">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label className="mb-2 block">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoFocus
                required
                className="h-11 rounded-xl"
              />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label>Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary font-medium hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input.Password
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="h-11 rounded-xl"
              />
            </div>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={login.isPending}
              className="rounded-xl"
            >
              Sign in
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-primary font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
        <p className="text-center text-sm text-muted-foreground">
          Account not verified yet?{" "}
          <button
            type="button"
            onClick={() => {
              setResendEmail(email);
              setResendOpen(true);
            }}
            className="text-primary font-medium hover:underline"
          >
            Resend verification email
          </button>
        </p>
      </div>

      <Modal
        title="Resend verification email"
        open={resendOpen}
        onCancel={() => setResendOpen(false)}
        footer={null}
        destroyOnHidden
      >
        {resendVerification.isSuccess ? (
          <p className="text-sm text-muted-foreground pt-2">
            If that email is registered and unverified, a link has been sent.
            Check your inbox.
          </p>
        ) : (
          <form
            className="space-y-4 pt-2"
            onSubmit={(e) => {
              e.preventDefault();
              resendVerification.mutate({ email: resendEmail });
            }}
          >
            <div>
              <Label className="mb-2 block">Email</Label>
              <Input
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                placeholder="you@example.com"
                autoFocus
                required
                className="h-11 rounded-xl"
              />
            </div>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={resendVerification.isPending}
              className="rounded-xl"
            >
              Send link
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
