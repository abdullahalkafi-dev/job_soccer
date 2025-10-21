

export type TCreateAccount = {
  name: string;
  email: string | undefined;
  otp: string;
  theme:
    | "theme-red"
    | "theme-green"
    | "theme-purple"
    | "theme-orange"
    | "theme-blue";
  expiresIn?: Number;
};

export type TResetPassword = {
  email: string | undefined;
  otp: string;
  name: string;
  theme:
    | "theme-red"
    | "theme-green"
    | "theme-purple"
    | "theme-orange"
    | "theme-blue";
  expiresIn?: Number;
};

export type ISendEmail = {
  to: string | undefined;
  subject: string;
  html: string;
};

