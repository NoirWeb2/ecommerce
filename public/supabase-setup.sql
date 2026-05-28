-- ================================================================
-- NOIR LOVERS — Setup completo para Supabase
-- Corre este script en Supabase > SQL Editor > New Query
-- ================================================================

-- ENUMS
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'ADMIN', 'SUPER_ADMIN');
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'DRAFT', 'ARCHIVED');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
CREATE TYPE "PaymentMethod" AS ENUM ('STRIPE', 'MERCADOPAGO', 'PSE', 'NEQUI', 'BANCOLOMBIA', 'COD');
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED', 'FREE_SHIPPING');
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENT', 'CANCELLED');
CREATE TYPE "AutomationType" AS ENUM ('WELCOME', 'ABANDONED_CART', 'ORDER_CONFIRMATION', 'ORDER_SHIPPED', 'REPURCHASE', 'BIRTHDAY_DISCOUNT');

-- USERS
CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  "emailVerified" TIMESTAMPTZ,
  name TEXT,
  "firstName" TEXT,
  "lastName" TEXT,
  phone TEXT,
  password TEXT,
  image TEXT,
  role "Role" NOT NULL DEFAULT 'CUSTOMER',
  birthday TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ACCOUNTS
CREATE TABLE accounts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INT,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  UNIQUE(provider, "providerAccountId")
);

-- SESSIONS
CREATE TABLE sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "sessionToken" TEXT UNIQUE NOT NULL,
  "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMPTZ NOT NULL
);

-- CATEGORIES
CREATE TABLE categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image TEXT,
  "order" INT NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- COLLECTIONS
CREATE TABLE collections (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image TEXT,
  banner TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "isFeatured" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PRODUCTS
CREATE TABLE products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price FLOAT NOT NULL,
  "comparePrice" FLOAT,
  sku TEXT UNIQUE,
  status "ProductStatus" NOT NULL DEFAULT 'DRAFT',
  "isFeatured" BOOLEAN NOT NULL DEFAULT FALSE,
  "isNew" BOOLEAN NOT NULL DEFAULT FALSE,
  "categoryId" TEXT REFERENCES categories(id),
  "collectionId" TEXT REFERENCES collections(id),
  tags TEXT[] DEFAULT '{}',
  "metaTitle" TEXT,
  "metaDesc" TEXT,
  weight FLOAT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- VARIANTS
CREATE TABLE variants (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "productId" TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size TEXT,
  color TEXT,
  stock INT NOT NULL DEFAULT 0,
  sku TEXT,
  price FLOAT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PRODUCT IMAGES
CREATE TABLE product_images (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "productId" TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  "order" INT NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PRODUCT VIDEOS
CREATE TABLE product_videos (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "productId" TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  thumbnail TEXT,
  "order" INT NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- REVIEWS
CREATE TABLE reviews (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "productId" TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INT NOT NULL,
  comment TEXT,
  "isApproved" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CARTS
CREATE TABLE carts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  "sessionId" TEXT UNIQUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CART ITEMS
CREATE TABLE cart_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "cartId" TEXT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  "productId" TEXT NOT NULL REFERENCES products(id),
  "variantId" TEXT REFERENCES variants(id),
  quantity INT NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- WISHLISTS
CREATE TABLE wishlists (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- WISHLIST ITEMS
CREATE TABLE wishlist_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "wishlistId" TEXT NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  "productId" TEXT NOT NULL REFERENCES products(id),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE("wishlistId", "productId")
);

-- COUPONS
CREATE TABLE coupons (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  type "DiscountType" NOT NULL,
  value FLOAT NOT NULL,
  "minCartValue" FLOAT,
  "maxUses" INT,
  "usedCount" INT NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "startDate" TIMESTAMPTZ,
  "endDate" TIMESTAMPTZ,
  "categoryId" TEXT,
  "productId" TEXT,
  "firstPurchase" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ORDERS
CREATE TABLE orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "orderNumber" TEXT UNIQUE NOT NULL,
  "userId" TEXT REFERENCES users(id),
  email TEXT NOT NULL,
  status "OrderStatus" NOT NULL DEFAULT 'PENDING',
  "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "paymentMethod" "PaymentMethod",
  "paymentId" TEXT,
  subtotal FLOAT NOT NULL,
  discount FLOAT NOT NULL DEFAULT 0,
  shipping FLOAT NOT NULL DEFAULT 0,
  total FLOAT NOT NULL,
  "couponId" TEXT REFERENCES coupons(id),
  notes TEXT,
  "shippingAddress" JSONB NOT NULL,
  "billingAddress" JSONB,
  tracking TEXT,
  "shippedAt" TIMESTAMPTZ,
  "deliveredAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ORDER ITEMS
CREATE TABLE order_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "orderId" TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  "productId" TEXT NOT NULL REFERENCES products(id),
  "variantId" TEXT REFERENCES variants(id),
  quantity INT NOT NULL,
  price FLOAT NOT NULL,
  name TEXT NOT NULL,
  image TEXT,
  size TEXT,
  color TEXT
);

-- ADDRESSES
CREATE TABLE addresses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  address1 TEXT NOT NULL,
  address2 TEXT,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT NOT NULL DEFAULT 'CO',
  "zipCode" TEXT,
  phone TEXT,
  "isDefault" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- USER COUPONS
CREATE TABLE user_coupons (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "couponId" TEXT NOT NULL REFERENCES coupons(id),
  "usedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE("userId", "couponId")
);

-- REWARDS
CREATE TABLE rewards (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points INT NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- EMAIL CAMPAIGNS
CREATE TABLE email_campaigns (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  "htmlContent" TEXT NOT NULL,
  status "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
  segment TEXT,
  "sentCount" INT NOT NULL DEFAULT 0,
  "openRate" FLOAT,
  "clickRate" FLOAT,
  "scheduledAt" TIMESTAMPTZ,
  "sentAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- EMAIL AUTOMATIONS
CREATE TABLE email_automations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  type "AutomationType" UNIQUE NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  "htmlContent" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT FALSE,
  "delayHours" INT NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- VERIFICATION TOKENS
CREATE TABLE verification_tokens (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  token TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ANNOUNCEMENT BARS
CREATE TABLE announcement_bars (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  text TEXT NOT NULL,
  link TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "order" INT NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TOTAL LOOKS
CREATE TABLE total_looks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "order" INT NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================================
-- SEED: Admin users + coupon BIENVENIDA10
-- ================================================================

INSERT INTO users (id, email, name, password, role, "emailVerified", "createdAt", "updatedAt")
VALUES
  ('admin-noir-001', 'admin@noirlovers.com', 'Admin NOIR', '$2a$12$zA1LQ4oXErToRK1ORUQ4eOupCsAX4FF.9Sv.zTPBx8cofx4GvCBPG', 'SUPER_ADMIN', NOW(), NOW(), NOW()),
  ('admin-noir-002', 'hello@noirlovers.com', 'NOIR LOVERS', '$2a$12$zA1LQ4oXErToRK1ORUQ4eOupCsAX4FF.9Sv.zTPBx8cofx4GvCBPG', 'SUPER_ADMIN', NOW(), NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  "updatedAt" = NOW();

INSERT INTO coupons (id, code, description, type, value, "isActive", "maxUses", "createdAt", "updatedAt")
VALUES (
  'coupon-bienvenida-001',
  'BIENVENIDA10',
  '10% de descuento de bienvenida',
  'PERCENTAGE',
  10,
  TRUE,
  NULL,
  NOW(),
  NOW()
) ON CONFLICT (code) DO NOTHING;

-- ================================================================
-- LISTO! Tablas creadas y usuarios admin insertados.
-- Credenciales:
--   admin@noirlovers.com / B4d1n%-$n83n
--   hello@noirlovers.com / B4d1n%-$n83n
-- ================================================================
