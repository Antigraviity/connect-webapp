// OTP Display Component for Development Mode
// This shows the OTP directly on the form during development

import { FaCopy, FaCheckCircle } from "react-icons/fa";
import { useState } from "react";

interface OTPDisplayProps {
  otp: string;
  label?: string;
}

export default function OTPDisplay({ otp, label = "OTP" }: OTPDisplayProps) {
  const [copied, setCopied] = useState(false);

  if (!otp || process.env.NODE_ENV === "production") {
    return null; // Don't show in production
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(otp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-4 mb-4 animate-pulse-slow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-green-800 mb-1">
            🔓 Development Mode - {label}
          </p>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-green-900 tracking-[0.5em] font-mono">
              {otp}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-all transform hover:scale-105 active:scale-95"
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
      <p className="text-xs text-green-700 mt-2 italic">
        ⚠️ This will not appear in production mode
      </p>
    </div>
  );
}
