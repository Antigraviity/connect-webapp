import type { Metadata } from "next";
import SignUpForm from "@/components/signin/SignUpForm";

export const metadata: Metadata = {
  title: "Sign Up | Company name",
  description: "Create your Company name account",
};

export default function RegisterPage() {
  return <SignUpForm />;
}
