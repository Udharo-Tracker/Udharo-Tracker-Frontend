import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Button, Card, Input } from "antd";
import { Store } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useLogin } from "@/api/auth.api";

type LocationState = { from?: { pathname: string } };

export function Login() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const login = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (isAuthenticated) {
    const redirectTo = (location.state as LocationState | null)?.from?.pathname ?? "/";
    return <Navigate to={redirectTo} replace />;
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(
      { email, password },
      {
        onSuccess: () => {
          const redirectTo = (location.state as LocationState | null)?.from?.pathname ?? "/";
          navigate(redirectTo, { replace: true });
        },
        onError: () => {
          toast.error("Login failed", { description: "Check your email and password and try again." });
        },
      }
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
            <div className="text-sm text-muted-foreground">Sign in to manage your shop credit</div>
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
              <Label className="mb-2 block">Password</Label>
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
          <Link to="/signup" className="text-primary font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
