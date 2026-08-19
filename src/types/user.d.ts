type Gender = "male" | "female" | "other";

interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  gender?: Gender | "" | null;
  date_of_birth?: string | null;
  profile_picture?: string | null;
  phone_number?: string;
  created_at: string | null;
  updated_at: string | null;
}

type UserProfileUpdateInput = Partial<
  Omit<
    UserProfile,
    "id" | "email" | "created_at" | "updated_at" | "profile_picture"
  >
> & {
  profile_picture?: File | string | null;
};

interface UserRegisterInput {
  email: string;
  password: string;
  confirm_password: string;
  first_name?: string;
  last_name?: string;
  gender?: Gender | "" | null;
  date_of_birth?: string | null;
  profile_picture?: string | null;
  phone_number?: string;
  shop_name: string;
  shop_phone?: string;
  shop_address?: string;
}

interface UserForgotPasswordInput {
  email: string;
}

interface UserPasswordResetInput {
  password: string;
  confirm_password: string;
  token: string;
  uid: string;
}

interface UserChangePasswordInput {
  old_password: string;
  password: string;
  confirm_password: string;
}

type UserChangePasswordPartialInput = Partial<UserChangePasswordInput>;

// `uid`/`token` come off the query string of the link mailed to the user —
// read them from the landing page URL, don't construct them.
interface EmailVerifyConfirmInput {
  uid: string;
  token: string;
}

interface ResendVerificationEmailInput {
  email: string;
}

// A handful of auth endpoints (email verify/resend, forgot-password) just
// reply with a static status message rather than a resource.
interface MessageResponse {
  message: string;
}
