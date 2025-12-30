import type { Metadata } from "next";
import SignUpForm from "@/components/signin/SignUpForm";

export const metadata: Metadata = {
  title: "Sign Up | Forge India Connect",
  description: "Create your Forge India Connect account",
};

export default function RegisterPage() {
  return <SignUpForm />;
}
