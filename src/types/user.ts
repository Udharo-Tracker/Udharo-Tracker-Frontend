export type Gender = "male" | "female" | "other";

export interface UserProfile {
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

export type UserProfileUpdateInput = Partial<
  Omit<UserProfile, "id" | "email" | "created_at" | "updated_at">
>;

export interface UserRegisterInput {
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

export interface UserForgotPasswordInput {
  email: string;
}

export interface UserPasswordResetInput {
  password: string;
  confirm_password: string;
  token: string;
  uid: string;
}

export interface UserChangePasswordInput {
  old_password: string;
  password: string;
  confirm_password: string;
}

export type UserChangePasswordPartialInput = Partial<UserChangePasswordInput>;
