import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button, Card } from "antd";
import { CircleCheck, CircleX, Loader2, MailCheck } from "lucide-react";
import { useVerifyEmail } from "@/api/auth.api";
import { getApiErrorMessage } from "@/api/client";

// uid/token come off the query string of the link mailed to the user
// (?uid=...&token=...) — read them from the URL, don't construct them.
// The link is one-time-use: a reused link returns 400, so this only fires
// once per mount even under React 18 StrictMode's double-invoke.
export function VerifyEmail() {
  const [params] = useSearchParams();
  const uid = params.get("uid") ?? "";
  const token = params.get("token") ?? "";
  const verifyEmail = useVerifyEmail();
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current || !uid || !token) return;
    attempted.current = true;
    verifyEmail.mutate({ uid, token });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, token]);

  const linkInvalid = !uid || !token;

  return (
    <div className="min-h-screen grid place-items-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="size-12 rounded-2xl bg-primary-soft grid place-items-center">
            <MailCheck className="size-6 text-primary" />
          </div>
          <div className="font-semibold text-lg">Email verification</div>
        </div>

        <Card className="p-6 rounded-3xl border-none shadow-sm">
          {linkInvalid ? (
            <VerifyState
              icon={<CircleX className="size-6 text-danger" />}
              tone="danger"
              message="This verification link is missing or malformed."
            />
          ) : verifyEmail.isPending || verifyEmail.isIdle ? (
            <VerifyState
              icon={<Loader2 className="size-6 text-primary animate-spin" />}
              tone="primary"
              message="Verifying your email…"
            />
          ) : verifyEmail.isSuccess ? (
            <VerifyState
              icon={<CircleCheck className="size-6 text-success" />}
              tone="success"
              message="Your email is verified. You can now sign in."
              action={
                <Link to="/login">
                  <Button
                    type="primary"
                    size="large"
                    block
                    className="rounded-xl"
                  >
                    Sign in
                  </Button>
                </Link>
              }
            />
          ) : (
            <VerifyState
              icon={<CircleX className="size-6 text-danger" />}
              tone="danger"
              message={getApiErrorMessage(
                verifyEmail.error,
                "This link has expired or was already used.",
              )}
              action={
                <Link to="/login">
                  <Button size="large" block className="rounded-xl">
                    Back to sign in
                  </Button>
                </Link>
              }
            />
          )}
        </Card>
      </div>
    </div>
  );
}

function VerifyState({
  icon,
  tone,
  message,
  action,
}: {
  icon: React.ReactNode;
  tone: "primary" | "success" | "danger";
  message: string;
  action?: React.ReactNode;
}) {
  const bg = {
    primary: "bg-primary-soft",
    success: "bg-success-soft",
    danger: "bg-danger-soft",
  }[tone];
  return (
    <div className="text-center space-y-4 py-2">
      <div
        className={`size-12 mx-auto rounded-2xl ${bg} grid place-items-center`}
      >
        {icon}
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
      {action}
    </div>
  );
}
