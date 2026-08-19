import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card, Input } from "antd";
import { KeyRound, MailCheck } from "lucide-react";
import { Label } from "@/components/shared/Label";
import { useForgotPassword } from "@/api/auth.api";

export function ForgotPassword() {
  const forgotPassword = useForgotPassword();
  const [email, setEmail] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // Always 200 regardless of whether the email is registered — don't
    // branch UI on the response, just show the same "check your inbox"
    // state either way.
    forgotPassword.mutate({ email });
  };

  return (
    <div className="min-h-screen grid place-items-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="size-12 rounded-2xl bg-primary-soft grid place-items-center">
            <KeyRound className="size-6 text-primary" />
          </div>
          <div>
            <div className="font-semibold text-lg">Forgot password</div>
            <div className="text-sm text-muted-foreground">
              We'll email you a link to reset it
            </div>
          </div>
        </div>

        <Card className="p-6 rounded-3xl border-none shadow-sm">
          {forgotPassword.isSuccess ? (
            <div className="text-center space-y-3 py-2">
              <div className="size-12 mx-auto rounded-2xl bg-success-soft grid place-items-center">
                <MailCheck className="size-6 text-success" />
              </div>
              <p className="text-sm text-muted-foreground">
                If <span className="font-medium text-foreground">{email}</span>{" "}
                is registered, a reset link is on its way. Check your inbox.
              </p>
            </div>
          ) : (
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
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={forgotPassword.isPending}
                className="rounded-xl"
              >
                Send reset link
              </Button>
            </form>
          )}
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Remembered it?{" "}
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
