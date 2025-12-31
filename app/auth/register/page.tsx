import type { Metadata } from "next";
import { Suspense } from "react";
import SignUpForm from "@/components/signin/SignUpForm";

export const metadata: Metadata = {
  title: "Sign Up | Forge India Connect",
  description: "Create your Forge India Connect account",
};

function SignUpLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-primary-300 to-primary-500">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl w-full max-w-2xl p-6 md:p-8 mx-3 my-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<SignUpLoading />}>
      <SignUpForm />
    </Suspense>
  );
}
