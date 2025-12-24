// In-memory OTP store (in production, use Redis or database)
interface OTPData {
  otp: string;
  expiresAt: number;
}

class OTPStore {
  private store: Map<string, OTPData>;

  constructor() {
    this.store = new Map();
  }

  // Normalize phone number format consistently
  private normalizePhone(phone: string): string {
    // Remove any spaces, dashes, or other characters
    const cleaned = phone.replace(/[^\d+]/g, '');

    // If it starts with +91, keep it
    if (cleaned.startsWith('+91')) {
      return cleaned;
    }

    // If it starts with 91, add the +
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      return '+' + cleaned;
    }

    // If it's just 10 digits, add +91
    if (cleaned.length === 10 && /^\d{10}$/.test(cleaned)) {
      return '+91' + cleaned;
    }

    // Return as-is if we can't normalize
    return phone;
  }

  set(phone: string, data: OTPData): void {
    const normalizedPhone = this.normalizePhone(phone);
    this.store.set(normalizedPhone, data);
    console.log(`📱 OTP stored for ${normalizedPhone}, expires at ${new Date(data.expiresAt).toLocaleString()}`);
    console.log(`📊 Current store size: ${this.store.size}`);
  }

  get(phone: string): OTPData | undefined {
    const normalizedPhone = this.normalizePhone(phone);
    const data = this.store.get(normalizedPhone);
    console.log(`🔍 OTP lookup for ${normalizedPhone}:`, data ? 'FOUND' : 'NOT FOUND');

    if (!data) {
      // Debug: show all stored keys
      console.log('📋 All stored phone numbers:', Array.from(this.store.keys()));
    }

    return data;
  }

  delete(phone: string): boolean {
    const normalizedPhone = this.normalizePhone(phone);
    const result = this.store.delete(normalizedPhone);
    console.log(`🗑️ OTP deleted for ${normalizedPhone}:`, result ? 'SUCCESS' : 'FAILED');
    return result;
  }

  clear(): void {
    this.store.clear();
  }

  // Clean up expired OTPs
  cleanup(): void {
    const now = Date.now();
    let deletedCount = 0;
    for (const [phone, data] of this.store.entries()) {
      if (data.expiresAt < now) {
        this.store.delete(phone);
        deletedCount++;
      }
    }
    if (deletedCount > 0) {
      console.log(`🧹 Cleaned up ${deletedCount} expired OTPs`);
    }
  }

  // Debug method to see all stored OTPs
  debug(): void {
    console.log('📊 OTP Store Debug:', {
      count: this.store.size,
      entries: Array.from(this.store.entries()).map(([phone, data]) => ({
        phone,
        otp: data.otp,
        expiresAt: new Date(data.expiresAt).toLocaleString(),
        isValid: data.expiresAt > Date.now()
      }))
    });
  }
}

// Create singleton instance with global persistence for development
const globalForOTP = globalThis as unknown as { otpStore: OTPStore };

const otpStore = globalForOTP.otpStore || new OTPStore();

if (process.env.NODE_ENV !== 'production') {
  globalForOTP.otpStore = otpStore;
}

// Run cleanup every 15 minutes
// Store interval reference to avoid duplicates in development
const globalForInterval = globalThis as unknown as { otpCleanupInterval: NodeJS.Timeout };

if (typeof setInterval !== 'undefined') {
  if (globalForInterval.otpCleanupInterval) {
    clearInterval(globalForInterval.otpCleanupInterval);
  }

  globalForInterval.otpCleanupInterval = setInterval(() => {
    otpStore.cleanup();
  }, 15 * 60 * 1000);
}

export default otpStore;