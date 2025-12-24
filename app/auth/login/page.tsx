import SignInForm from "@/components/signin/SignInForm";

export const metadata = {
  title: "Sign In | Company name",
  description: "Sign in to your Company name account",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-primary-300 to-primary-500 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <SignInForm />
    </div>
  );
}
