# Spencer Green Hotel - Hotel Management System

## Problem Statement
Build a full-stack Hotel Management System (HMS) for Spencer Green Hotel Batu with:
- Public website like kempinski.com
- Admin dashboard for hotel management
- Emerald & White theme
- Booking engine with date validation
- TikTok-style gallery
- Email voucher via Resend
- WhatsApp redirect for payment

## Architecture

### Backend (FastAPI + MongoDB)
- **Auth**: JWT-based authentication with bcrypt password hashing
- **Models**: User, RoomType, RoomInventory, Reservation, Review, PromoCode, SiteContent
- **Endpoints**:
  - `/api/auth/*` - Login, register, forgot/reset password
  - `/api/rooms` - Room types CRUD
  - `/api/inventory` - Room inventory management
  - `/api/availability` - Check room availability
  - `/api/reservations` - Booking management
  - `/api/reviews` - Guest reviews
  - `/api/admin/*` - Admin dashboard, users, promo codes, CMS

### Frontend (React + Tailwind + Shadcn/UI)
- **Public Pages**: Home, Rooms, Meeting, Wedding, Facilities, Gallery, Check Reservation
- **Admin Pages**: Dashboard, Room Management, Reservations, Users, Promo Codes, Reviews, Content Management
- **Features**:
  - Booking engine with date pickers (check-in today, check-out tomorrow default)
  - TikTok-style vertical scroll gallery
  - Responsive design with hamburger menu
  - Admin sidebar navigation

## Completed Tasks
1. ✅ Backend API with all endpoints
2. ✅ Public website with all pages
3. ✅ Booking engine with date validation
4. ✅ Admin dashboard with metrics
5. ✅ Room management (allotment, rates, close out)
6. ✅ Bulk update for inventory
7. ✅ Reservation management with status updates
8. ✅ User management with roles
9. ✅ Promo codes management
10. ✅ Review moderation
11. ✅ CMS for content management
12. ✅ TikTok-style gallery
13. ✅ WhatsApp redirect for payment
14. ✅ Email voucher setup (Resend integration ready)

## Next Tasks
1. Configure Resend API key for actual email sending
2. Add room image upload functionality
3. Add video tour upload for rooms
4. Implement payment gateway integration
5. Add reporting/analytics features
6. Add multi-language support
7. Add SEO optimization

## Credentials
- Admin: admin@spencergreenhotel.com / admin123
- WhatsApp: 6281334480210
