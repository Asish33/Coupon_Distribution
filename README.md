# Coupon Distribution System

A web application for managing and distributing unique coupon codes to users with administrative capabilities.

## Features

### Public Features
- Claim unique coupon codes
- 24-hour cooldown period between claims
- Browser-based tracking to prevent abuse
- Real-time feedback on claim status

### Admin Features
- Secure admin login system
- Create and manage coupon codes
- View claims history
- Toggle coupon activation status
- Monitor coupon usage

## Technical Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)

## Database Schema

### Tables

1. **coupons**
   - `id` (uuid, primary key)
   - `code` (text, unique)
   - `description` (text)
   - `is_active` (boolean)
   - `is_claimed` (boolean)
   - `created_at` (timestamp)

2. **claims**
   - `id` (uuid, primary key)
   - `coupon_id` (uuid, foreign key)
   - `ip_address` (text)
   - `browser_id` (text)
   - `claimed_at` (timestamp)

3. **cooldowns**
   - `id` (uuid, primary key)
   - `ip_address` (text)
   - `browser_id` (text)
   - `last_claim` (timestamp)

## Security Features

### Row Level Security (RLS)
- Coupons table: Public can only read active, unclaimed coupons
- Claims table: Public can create claims, admin can read all
- Cooldowns table: Public access for managing claim cooldowns

### Authentication
- Email/password authentication for admin access
- Protected admin routes
- Secure session management

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env`:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Admin Access

Default admin credentials (change in production):
- Email: admin@example.com
- Password: admin123

## Usage

### Public Users
1. Visit the homepage
2. Click "Claim Coupon"
3. Receive unique coupon code
4. Wait 24 hours before claiming another

### Administrators
1. Login through admin portal
2. Create new coupon codes
3. Monitor claims
4. Manage coupon status

## Development

### Project Structure
```
src/
├── components/         # React components
├── lib/               # Utilities and configurations
├── App.tsx            # Main application component
└── main.tsx          # Application entry point

supabase/
└── migrations/        # Database migrations
```

### Key Components

1. **CouponClaim.tsx**
   - Public interface for claiming coupons
   - Handles cooldown logic
   - Manages browser identification

2. **AdminPanel.tsx**
   - Coupon management interface
   - Claims history viewing
   - Coupon status toggling

3. **AdminLogin.tsx**
   - Secure admin authentication
   - Protected route handling

## Deployment

1. Build the project:
   ```bash
   npm run build
   ```
2. Deploy the `dist` directory to your hosting service

## Security Considerations

1. **Rate Limiting**
   - 24-hour cooldown between claims
   - Browser fingerprinting
   - IP tracking

2. **Access Control**
   - Row Level Security
   - Protected admin routes
   - Secure authentication

3. **Data Protection**
   - Unique coupon codes
   - Claim verification
   - Audit trail

## Maintenance

### Regular Tasks
1. Monitor coupon usage
2. Review claims history
3. Update admin credentials
4. Check system logs

### Best Practices
1. Regularly backup database
2. Monitor error logs
3. Update dependencies
4. Review security policies