# Connect Platform - Complete Service Marketplace Platform

A comprehensive multi-vendor service marketplace built with Next.js 15, TypeScript, Prisma, and Tailwind CSS.

## 🚀 Features

### Core Features

- ✅ Multi-vendor service marketplace
- ✅ User, Seller, and Admin roles
- ✅ Service listing with categories and sub-categories
- ✅ Advanced search and filtering
- ✅ Booking and scheduling system
- ✅ Multiple payment gateways (Stripe, Razorpay, PayPal, etc.)
- ✅ Review and rating system
- ✅ Favorites/Wishlist
- ✅ Real-time notifications
- ✅ Messaging system
- ✅ Support ticket system
- ✅ Wallet system
- ✅ Geo-location based services
- ✅ SEO optimized
- ✅ Responsive design

### User Features

- User registration and authentication
- Social login (Google, Facebook)
- Profile management
- Service browsing and booking
- Order tracking
- Review and ratings
- Favorites/Wishlist
- Wallet management
- Support tickets
- Notifications

### Seller Features

- Seller dashboard
- Service management (Create, Edit, Delete)
- Order management
- Schedule management
- Earnings and payout history
- Customer communication
- Analytics and reports
- Profile customization

### Admin Features

- Complete admin dashboard
- User management
- Seller approval and management
- Service moderation
- Order management
- Category management
- Payment management
- Site settings
- SEO settings
- Tax configuration
- Email templates
- Analytics and reports
- Page builder
- Blog management

## 📁 Project Structure

```
qixer-marketplace/
├── app/                          # Next.js App Directory
│   ├── (auth)/                  # Authentication routes
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── verify-email/
│   ├── (dashboard)/             # Dashboard routes
│   │   ├── user/                # User dashboard
│   │   ├── seller/              # Seller dashboard
│   │   └── admin/               # Admin dashboard
│   ├── services/                # Service pages
│   │   ├── [slug]/             # Service details
│   │   └── category/[slug]/    # Services by category
│   ├── booking/                 # Booking pages
│   │   ├── [serviceId]/
│   │   └── success/
│   ├── api/                     # API routes
│   │   ├── auth/
│   │   ├── services/
│   │   ├── orders/
│   │   ├── payments/
│   │   ├── users/
│   │   └── admin/
│   ├── about/                   # About page
│   ├── contact/                 # Contact page
│   ├── blog/                    # Blog pages
│   ├── privacy-policy/          # Privacy policy
│   ├── terms-conditions/        # Terms and conditions
│   ├── faq/                     # FAQ page
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles
├── components/                  # React components
│   ├── home/                    # Home page components
│   ├── shared/                  # Shared components
│   ├── forms/                   # Form components
│   ├── cards/                   # Card components
│   ├── modals/                  # Modal components
│   └── layouts/                 # Layout components
├── lib/                         # Utility functions
│   ├── actions/                 # Server actions
│   ├── utils/                   # Utility functions
│   ├── hooks/                   # Custom React hooks
│   ├── validations/             # Zod schemas
│   └── prisma.ts                # Prisma client
├── prisma/                      # Database
│   └── schema.prisma            # Database schema
├── public/                      # Static assets
│   ├── images/
│   └── icons/
├── .env.example                 # Environment variables example
├── next.config.js               # Next.js configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies

```

## 🛠️ Installation

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Setup Steps

1. **Install Dependencies**

```bash
npm install
```

2. **Environment Setup**

```bash
cp .env.example .env
```

Then edit `.env` with your configuration:

- Database URL
- Authentication secrets
- Payment gateway keys
- Email SMTP settings
- Cloud storage credentials

3. **Database Setup**

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed database
npx prisma db seed
```

4. **Run Development Server**

```bash
npm run dev
```

Visit `http://localhost:3000`

## 📊 Database Schema

The application uses PostgreSQL with Prisma ORM. Key models include:

- **User**: User accounts with roles (USER, SELLER, ADMIN)
- **Service**: Service listings with full details
- **Category/SubCategory**: Service categorization
- **Order**: Booking orders
- **Review**: Service reviews and ratings
- **Ticket**: Support ticket system
- **Message**: Direct messaging between users
- **Notification**: System notifications
- **WalletTransaction**: Wallet transactions
- **SiteSetting**: Site configuration
- **Page**: Dynamic pages
- **Blog**: Blog posts

## 🔐 Authentication

- Email/Password authentication
- Social login (Google, Facebook)
- JWT-based sessions
- Role-based access control
- Email verification
- Password reset

## 💳 Payment Gateways

Integrated payment gateways:

- Stripe
- Razorpay
- PayPal
- Cashfree
- Flutterwave
- Instamojo
- Bank Transfer
- Cash on Service
- Wallet

## 📧 Email System

- Nodemailer for SMTP
- Email templates:
  - Welcome email
  - Order confirmation
  - Order status updates
  - Password reset
  - Verification email
  - Notifications

## 🗺️ Location Features

- Google Maps integration
- Geo-location based service discovery
- Service radius configuration
- Location-based search and filtering

## 📱 Pages Included

### Public Pages

1. Home (4 variants)
2. Services listing
3. Service details
4. Category pages
5. Search results
6. About us
7. Contact us
8. Blog
9. Blog post details
10. Privacy policy
11. Terms and conditions
12. FAQ

### User Dashboard

1. Dashboard overview
2. My bookings
3. My favorites
4. My reviews
5. My wallet
6. Messages
7. Notifications
8. Support tickets
9. Profile settings

### Seller Dashboard

1. Dashboard overview
2. My services
3. Add/Edit service
4. Orders
5. Schedule management
6. Earnings
7. Payout history
8. Reviews
9. Messages
10. Analytics
11. Profile settings

### Admin Dashboard

1. Dashboard overview
2. Users management
3. Sellers management
4. Services management
5. Orders management
6. Categories management
7. Reviews management
8. Tickets management
9. Transactions
10. Payouts
11. Site settings
12. Email templates
13. SEO settings
14. Tax settings
15. Page management
16. Blog management
17. Analytics

## 🎨 Design Features

- Modern, clean UI
- Fully responsive
- Dark mode support
- Smooth animations
- Loading states
- Error handling
- Toast notifications
- Modal dialogs
- Drag and drop file upload
- Rich text editor
- Calendar/date picker
- Star ratings
- Image galleries
- Maps integration

## 🔧 Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js
- **Forms**: React Hook Form + Zod
- **State Management**: Zustand
- **HTTP Client**: Axios
- **File Upload**: Cloudinary
- **Maps**: Google Maps API
- **Charts**: Recharts
- **Icons**: React Icons
- **Date**: date-fns
- **Notifications**: React Hot Toast

## 📝 API Routes

### Authentication

- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/forgot-password
- POST /api/auth/reset-password
- POST /api/auth/verify-email

### Services

- GET /api/services
- GET /api/services/[id]
- POST /api/services
- PUT /api/services/[id]
- DELETE /api/services/[id]
- GET /api/services/category/[slug]

### Orders

- GET /api/orders
- GET /api/orders/[id]
- POST /api/orders
- PUT /api/orders/[id]
- DELETE /api/orders/[id]

### Users

- GET /api/users/profile
- PUT /api/users/profile
- GET /api/users/favorites
- POST /api/users/favorites
- DELETE /api/users/favorites/[id]

### Payments

- POST /api/payments/stripe
- POST /api/payments/razorpay
- POST /api/payments/paypal
- POST /api/payments/webhook

### Admin

- GET /api/admin/dashboard
- GET /api/admin/users
- PUT /api/admin/users/[id]
- GET /api/admin/sellers
- PUT /api/admin/sellers/[id]/approve
- GET /api/admin/services
- PUT /api/admin/services/[id]/approve
- GET /api/admin/orders
- GET /api/admin/analytics

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables for Production

Ensure all environment variables are properly configured for production:

- Use production database URL
- Set secure NEXTAUTH_SECRET
- Configure production payment gateway keys
- Set production email credentials
- Configure production cloud storage

## 📄 License

This project is created for educational and commercial purposes.

## 🤝 Support

For support, email support@qixer.com or create a support ticket in the application.

## 🔄 Updates

This is version 1.0.0. Check for updates regularly.

---

Built with ❤️ using Next.js
