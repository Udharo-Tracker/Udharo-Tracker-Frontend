import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button, Card, Input, Steps } from "antd";
import { Store } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/shared/Label";
import { useAuth } from "@/hooks/use-auth";
import { useLogin, useRegister } from "@/api/auth.api";

const steps = [
  { title: "Account" },
  { title: "Shop" },
];

export function Signup() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const register = useRegister();
  const login = useLogin();

  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [shopName, setShopName] = useState("");
  const [shopPhone, setShopPhone] = useState("");
  const [shopAddress, setShopAddress] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const passwordsMatch = password === confirmPassword;
  const accountValid = email && password && confirmPassword && passwordsMatch;
  const shopValid = shopName.trim().length > 0;

  const next = () => {
    if (!accountValid) return;
    setStep(1);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 0) {
      next();
      return;
    }
    if (!accountValid || !shopValid) return;

    register.mutate(
      {
        email,
        password,
        confirm_password: confirmPassword,
        first_name: firstName || undefined,
        last_name: lastName || undefined,
        phone_number: phoneNumber || undefined,
        shop_name: shopName,
        shop_phone: shopPhone || undefined,
        shop_address: shopAddress || undefined,
      },
      {
        onSuccess: () => {
          // Registration doesn't return tokens, so log in right after with the same credentials.
          login.mutate(
            { email, password },
            {
              onSuccess: () => {
                toast.success("Account created");
                navigate("/", { replace: true });
              },
              onError: () => {
                toast.success("Account created — please sign in");
                navigate("/login", { replace: true });
              },
            }
          );
        },
        onError: (error) => {
          toast.error("Couldn't create account", { description: error.message });
        },
      }
    );
  };

  return (
    <div className="min-h-screen grid place-items-center bg-background p-4 py-10">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="size-12 rounded-2xl bg-primary-soft grid place-items-center">
            <Store className="size-6 text-primary" />
          </div>
          <div>
            <div className="font-semibold text-lg">UdharoTrack</div>
            <div className="text-sm text-muted-foreground">Create your shop account</div>
          </div>
        </div>

        <Card className="p-6 rounded-3xl border-none shadow-sm space-y-6">
          <Steps current={step} items={steps} size="small" />

          <form onSubmit={submit} className="space-y-4">
            {step === 0 && (
              <>
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="mb-2 block">First name</Label>
                    <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Optional" className="h-11 rounded-xl" />
                  </div>
                  <div>
                    <Label className="mb-2 block">Last name</Label>
                    <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Optional" className="h-11 rounded-xl" />
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Phone number</Label>
                  <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="98xxxxxxxx" className="h-11 rounded-xl" />
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
                <div>
                  <Label className="mb-2 block">Confirm password</Label>
                  <Input.Password
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    status={confirmPassword && !passwordsMatch ? "error" : undefined}
                    className="h-11 rounded-xl"
                  />
                  {confirmPassword && !passwordsMatch && (
                    <div className="mt-1.5 text-xs text-danger">Passwords don't match.</div>
                  )}
                </div>

                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  disabled={!accountValid}
                  className="rounded-xl"
                >
                  Next
                </Button>
              </>
            )}

            {step === 1 && (
              <>
                <div>
                  <Label className="mb-2 block">Shop name</Label>
                  <Input value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="e.g. Ram General Store" autoFocus required className="h-11 rounded-xl" />
                </div>
                <div>
                  <Label className="mb-2 block">Shop phone</Label>
                  <Input value={shopPhone} onChange={(e) => setShopPhone(e.target.value)} placeholder="Optional" className="h-11 rounded-xl" />
                </div>
                <div>
                  <Label className="mb-2 block">Shop address</Label>
                  <Input value={shopAddress} onChange={(e) => setShopAddress(e.target.value)} placeholder="Optional" className="h-11 rounded-xl" />
                </div>

                <div className="flex gap-3">
                  <Button size="large" onClick={() => setStep(0)} className="rounded-xl flex-1">
                    Back
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    disabled={!shopValid}
                    loading={register.isPending || login.isPending}
                    className="rounded-xl flex-1"
                  >
                    Create account
                  </Button>
                </div>
              </>
            )}
          </form>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
