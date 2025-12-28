// OTP Display Component
// Shows the OTP directly on the form (temporary until SMS/Email is configured)

import { FaCopy, FaCheckCircle } from "react-icons/fa";
import { useState } from "react";

interface OTPDisplayProps {
  otp: string;
  label?: string;
}

export default function OTPDisplay({ otp, label = "OTP" }: OTPDisplayProps) {
  const [copied, setCopied] = useState(false);

  // Don't render if no OTP
  if (!otp) {
    return null;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(otp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-blue-800 mb-1">
            🔐 Your {label}
          </p>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-blue-900 tracking-[0.5em] font-mono">
              {otp}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-all transform hover:scale-105 active:scale-95"
            >
              {copied ? (
                <>
                  <FaCheckCircle className="w-3 h-3" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <FaCopy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      <p className="text-xs text-blue-600 mt-2">
        Enter this code in the field below to verify
      </p>
    </div>
  );
}
