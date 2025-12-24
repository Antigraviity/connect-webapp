# 🔧 BACKEND INTEGRATION GUIDE
## Connect Platform - Vendor System

---

## 📋 QUICK REFERENCE FOR DEVELOPERS

This guide provides the exact field mappings and API structure needed to integrate the vendor registration and settings system with your backend.

---

## 🗄️ DATABASE SCHEMA REQUIREMENTS

### Table: `vendors`

```sql
CREATE TABLE vendors (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Step 1: Mobile Verification
  phone VARCHAR(15) NOT NULL UNIQUE, -- Format: +91XXXXXXXXXX
  phone_verified BOOLEAN DEFAULT FALSE,
  phone_verified_at TIMESTAMP,
  
  -- Step 2: Business Information
  business_name VARCHAR(255) NOT NULL,
  business_type VARCHAR(50) NOT NULL, -- 'Service', 'Product', 'Both'
  category VARCHAR(100) NOT NULL, -- One of 6 categories
  service_name VARCHAR(200) NOT NULL, -- Depends on category
  business_address TEXT NOT NULL,
  pincode VARCHAR(6) NOT NULL, -- 6 digits only
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'India',
  service_radius INTEGER DEFAULT 10, -- in kilometers
  
  -- Step 2: Documents (Optional)
  document_type VARCHAR(50), -- 'GST Certificate', 'Udyam Certificate', 'Upload later'
  document_url TEXT, -- Cloud storage URL
  document_status VARCHAR(20) DEFAULT 'Pending', -- 'Pending', 'Verified', 'Rejected'
  document_uploaded_at TIMESTAMP,
  document_verified_at TIMESTAMP,
  
  -- Step 3: Owner Information
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP,
  password_hash TEXT NOT NULL,
  
  -- Additional Profile Fields
  owner_name VARCHAR(255),
  profile_picture_url TEXT,
  website VARCHAR(255),
  description TEXT,
  instagram_url VARCHAR(255),
  facebook_url VARCHAR(255),
  twitter_url VARCHAR(255),
  
  -- Business Tax Info
  business_entity_type VARCHAR(50),
  gst_number VARCHAR(15),
  pan_number VARCHAR(10),
  
  -- Account Status
  status VARCHAR(20) DEFAULT 'Active',
  verified BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP
);
```

---

## 🔌 COMPLETE API ENDPOINTS

### Registration Flow APIs

#### 1. Send Mobile OTP
```
POST /api/vendor/register/send-mobile-otp
```

**Request Body:**
```json
{
  "phone": "+919876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to +919876543210",
  "expires_in": 300
}
```

---

#### 2. Verify Mobile OTP
```
POST /api/vendor/register/verify-mobile-otp
```

**Request Body:**
```json
{
  "phone": "+919876543210",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Phone verified successfully",
  "temp_token": "temporary_session_token"
}
```

---

#### 3. Submit Business Information
```
POST /api/vendor/register/business-info
```

**Request Body (multipart/form-data):**
```json
{
  "temp_token": "temporary_session_token",
  "business_name": "John's Services",
  "business_type": "Service",
  "category": "Home Services",
  "service_name": "Plumbing Services",
  "business_address": "123 Main Street, Mumbai",
  "pincode": "400001",
  "document_type": "GST Certificate",
  "document": "<file_upload>"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Business information saved",
  "temp_token": "updated_temp_token",
  "document_url": "https://storage/docs/abc123.pdf"
}
```

---

#### 4. Send Email OTP
```
POST /api/vendor/register/send-email-otp
```

**Request Body:**
```json
{
  "temp_token": "temporary_session_token",
  "email": "vendor@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to email",
  "expires_in": 300
}
```

---

#### 5. Complete Registration
```
POST /api/vendor/register/complete
```

**Request Body:**
```json
{
  "temp_token": "temporary_session_token",
  "username": "johndoe123",
  "email": "vendor@example.com",
  "email_otp": "123456",
  "password": "SecurePass123!",
  "confirm_password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration completed",
  "vendor_id": "uuid-here",
  "auth_token": "jwt_token",
  "vendor": {
    "id": "uuid",
    "username": "johndoe123",
    "business_name": "John's Services",
    "email": "vendor@example.com",
    "phone": "+919876543210",
    "category": "Home Services",
    "service_name": "Plumbing Services"
  }
}
```

---

## 📊 FIELD MAPPING TABLE

| Frontend Field Name | Backend Column Name | Data Type | Required | Notes |
|---------------------|---------------------|-----------|----------|-------|
| **Registration Step 1** |
| phone | phone | VARCHAR(15) | Yes | Format: +91XXXXXXXXXX |
| otp | - | - | Yes | Verify only, don't store |
| **Registration Step 2** |
| businessName | business_name | VARCHAR(255) | Yes | - |
| businessType | business_type | VARCHAR(50) | Yes | Service/Product/Both |
| category | category | VARCHAR(100) | Yes | 6 categories |
| serviceName | service_name | VARCHAR(200) | Yes | Depends on category |
| businessAddress | business_address | TEXT | Yes | Full address |
| pincode | pincode | VARCHAR(6) | Yes | 6 digits |
| documentType | document_type | VARCHAR(50) | No | Optional |
| uploadedDocument | document_url | TEXT | No | Cloud storage URL |
| **Registration Step 3** |
| username | username | VARCHAR(50) | Yes | Unique |
| email | email | VARCHAR(255) | Yes | Unique |
| emailOtp | - | - | Yes | Verify only |
| password | password_hash | TEXT | Yes | Hash before storing |
| **Settings - Additional** |
| ownerName | owner_name | VARCHAR(255) | No | - |
| website | website | VARCHAR(255) | No | - |
| description | description | TEXT | No | Max 500 chars |
| - | profile_picture_url | TEXT | No | Cloud storage URL |
| - | instagram_url | VARCHAR(255) | No | - |
| - | facebook_url | VARCHAR(255) | No | - |
| - | twitter_url | VARCHAR(255) | No | - |
| - | gst_number | VARCHAR(15) | No | - |
| - | pan_number | VARCHAR(10) | No | - |
| - | city | VARCHAR(100) | No | Derived |
| - | state | VARCHAR(100) | No | Derived |
| - | country | VARCHAR(100) | No | Default: India |
| - | service_radius | INTEGER | No | Default: 10 km |

---

## 🎯 VALIDATION RULES

### Registration Step 1
```javascript
{
  phone: {
    required: true,
    pattern: /^\d{10}$/,
    message: "Phone must be 10 digits"
  },
  otp: {
    required: true,
    pattern: /^\d{6}$/,
    message: "OTP must be 6 digits"
  }
}
```

### Registration Step 2
```javascript
{
  business_name: {
    required: true,
    minLength: 3,
    maxLength: 255
  },
  business_type: {
    required: true,
    enum: ["Service", "Product", "Both"]
  },
  category: {
    required: true,
    enum: [
      "Beauty & Wellness",
      "Health & Medical",
      "Home Services",
      "Automotive",
      "Food & Catering",
      "Street Foods"
    ]
  },
  service_name: {
    required: true,
    // Must be valid for selected category
  },
  business_address: {
    required: true,
    minLength: 10
  },
  pincode: {
    required: true,
    pattern: /^\d{6}$/,
    message: "Pincode must be 6 digits"
  },
  document_type: {
    required: false,
    enum: ["GST Certificate", "Udyam Certificate", "Upload later"]
  }
}
```

### Registration Step 3
```javascript
{
  username: {
    required: true,
    minLength: 3,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9_]+$/,
    unique: true
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    unique: true
  },
  email_otp: {
    required: true,
    pattern: /^\d{6}$/
  },
  password: {
    required: true,
    minLength: 6,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    message: "Must include uppercase, lowercase, number, special character"
  },
  confirm_password: {
    required: true,
    matches: "password"
  }
}
```

---

## 📁 FILE UPLOAD SPECIFICATIONS

### Document Upload (Registration Step 2)
```javascript
{
  accepted_formats: [".pdf", ".jpg", ".jpeg", ".png"],
  max_size: "5MB",
  storage: "cloud_storage", // AWS S3, Cloudinary, etc.
  naming_convention: "vendor_{vendor_id}_{timestamp}_{original_name}"
}
```

### Profile Picture Upload
```javascript
{
  accepted_formats: [".jpg", ".jpeg", ".png", ".gif"],
  max_size: "2MB",
  resize: {
    width: 400,
    height: 400,
    crop: "fill"
  },
  storage: "cloud_storage"
}
```

---

## 🔐 SECURITY REQUIREMENTS

### Password Hashing
```javascript
// Use bcrypt with salt rounds >= 10
const bcrypt = require('bcrypt');
const saltRounds = 10;
const passwordHash = await bcrypt.hash(password, saltRounds);
```

### JWT Token
```javascript
// Include in token payload
{
  vendor_id: "uuid",
  username: "johndoe123",
  role: "vendor",
  exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
}
```

### OTP Generation
```javascript
// Generate 6-digit OTP
const otp = Math.floor(100000 + Math.random() * 900000).toString();
// Expires in 5 minutes
const expiresAt = Date.now() + (5 * 60 * 1000);
```

---

## 🔄 DATA FLOW DIAGRAM

```
┌──────────────────┐
│   FRONTEND       │
│  Registration    │
│   Form (Step 1)  │
└────────┬─────────┘
         │ POST /send-mobile-otp
         │ { phone: "+919876543210" }
         ↓
┌──────────────────┐
│   BACKEND API    │
│  Generate OTP    │
│  Send via SMS    │
└────────┬─────────┘
         │ Response: { success: true }
         ↓
┌──────────────────┐
│   FRONTEND       │
│ User enters OTP  │
└────────┬─────────┘
         │ POST /verify-mobile-otp
         │ { phone, otp }
         ↓
┌──────────────────┐
│   BACKEND API    │
│  Verify OTP      │
│  Create session  │
└────────┬─────────┘
         │ Response: { temp_token }
         ↓
┌──────────────────┐
│   FRONTEND       │
│ Move to Step 2   │
│ Business Info    │
└────────┬─────────┘
         │ POST /business-info
         │ { temp_token, business data, document }
         ↓
┌──────────────────┐
│   BACKEND API    │
│ Upload document  │
│ Save business    │
└────────┬─────────┘
         │ Response: { document_url }
         ↓
┌──────────────────┐
│   FRONTEND       │
│ Move to Step 3   │
│ Owner Info       │
└────────┬─────────┘
         │ POST /send-email-otp
         │ { temp_token, email }
         ↓
┌──────────────────┐
│   BACKEND API    │
│  Generate OTP    │
│  Send via Email  │
└────────┬─────────┘
         │ Response: { success: true }
         ↓
┌──────────────────┐
│   FRONTEND       │
│ User enters OTP  │
│ Submits form     │
└────────┬─────────┘
         │ POST /complete
         │ { temp_token, username, email, email_otp, password }
         ↓
┌──────────────────┐
│   BACKEND API    │
│ Verify email OTP │
│ Hash password    │
│ Create vendor    │
│ Generate JWT     │
└────────┬─────────┘
         │ Response: { auth_token, vendor }
         ↓
┌──────────────────┐
│   FRONTEND       │
│ Store JWT        │
│ Redirect to      │
│ /vendor/dashboard│
└──────────────────┘
```

---

## 📝 RESPONSE STATUS CODES

```javascript
200 OK                  // Success
201 Created            // Resource created
400 Bad Request        // Validation error
401 Unauthorized       // Invalid auth token
403 Forbidden          // Access denied
404 Not Found          // Resource not found
409 Conflict           // Duplicate entry (username/email exists)
422 Unprocessable      // OTP expired/invalid
500 Internal Error     // Server error
```

---

## ✅ TESTING CHECKLIST

### Registration Flow
- [ ] Mobile OTP sending works
- [ ] Mobile OTP verification works
- [ ] Invalid OTP rejected
- [ ] Expired OTP rejected (5 min)
- [ ] Business info saves with all fields
- [ ] Document upload works
- [ ] Category-service validation works
- [ ] Email OTP sending works
- [ ] Email OTP verification works
- [ ] Password validation enforced
- [ ] Username uniqueness checked
- [ ] Email uniqueness checked
- [ ] Vendor created in database
- [ ] JWT token generated
- [ ] Default notification preferences created

### Settings APIs
- [ ] Profile GET returns all fields
- [ ] Profile UPDATE saves changes
- [ ] Business GET returns all fields
- [ ] Business UPDATE saves changes
- [ ] Location GET returns all fields
- [ ] Location UPDATE saves changes
- [ ] Document re-upload works
- [ ] Notifications GET/UPDATE works
- [ ] Payment GET/UPDATE works
- [ ] Password change works
- [ ] All fields properly validated

---

## 🚀 DEPLOYMENT NOTES

### Environment Variables Needed
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=24h

# SMS Service (Twilio, AWS SNS, etc.)
SMS_API_KEY=your_sms_api_key
SMS_API_SECRET=your_sms_secret

# Email Service (SendGrid, AWS SES, etc.)
EMAIL_API_KEY=your_email_api_key
EMAIL_FROM=noreply@yourplatform.com

# File Storage (AWS S3, Cloudinary, etc.)
STORAGE_BUCKET=your_bucket_name
STORAGE_ACCESS_KEY=your_access_key
STORAGE_SECRET_KEY=your_secret_key

# OTP Settings
OTP_EXPIRY_MINUTES=5
OTP_LENGTH=6
```

---

## 📞 SUPPORT

For backend integration issues, contact the development team with:
1. API endpoint being called
2. Request payload (sanitized)
3. Response received
4. Expected behavior

---

**Document Version:** 1.0  
**Last Updated:** November 08, 2025  
**Status:** Ready for Implementation  

---
