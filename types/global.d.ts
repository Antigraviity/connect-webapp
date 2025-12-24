// Type declarations for global variables
declare global {
  var emailOtpStore: Map<string, { otp: string; timestamp: number; attempts?: number }> | undefined;
}

export {};
