-- =====================================================
-- REMS DATABASE - POSTGRESQL / SUPABASE
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,
    user_email VARCHAR(150) UNIQUE NOT NULL,
    user_mobile VARCHAR(15),
    password TEXT NOT NULL,
    role TEXT CHECK (role IN ('admin','agent','buyer','seller')) DEFAULT 'buyer',
    is_active BOOLEAN DEFAULT TRUE,
    is_mobile_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS properties (
    property_id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    type TEXT CHECK (type IN ('house','apartment','villa','commercial')) NOT NULL,
    listing_type TEXT CHECK (listing_type IN ('sale','rent')) DEFAULT 'sale',
    bedrooms INTEGER DEFAULT 0,
    bathrooms INTEGER DEFAULT 0,
    area INTEGER,
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    price NUMERIC(12,2) NOT NULL,
    status TEXT CHECK (status IN ('available','sold','rented')) DEFAULT 'available',
    verification_status TEXT CHECK (verification_status IN ('pending','approved','rejected')) DEFAULT 'pending',
    amenities JSONB DEFAULT '[]'::jsonb,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    views INTEGER DEFAULT 0,
    listed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS property_images (
    image_id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS property_documents (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(property_id) ON DELETE CASCADE,
    document_type VARCHAR(100),
    document_url TEXT,
    status TEXT CHECK (status IN ('pending','approved','rejected')) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_documents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    document_type VARCHAR(50),
    document_url TEXT,
    status TEXT CHECK (status IN ('pending','approved','rejected')) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
    booking_id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT CHECK (status IN ('pending','confirmed','cancelled')) DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS transactions (
    transaction_id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    buyer_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    seller_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL,
    payment_status TEXT CHECK (payment_status IN ('pending','completed','cancelled')) DEFAULT 'pending',
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
    payment_id SERIAL PRIMARY KEY,
    transaction_id INTEGER NOT NULL REFERENCES transactions(transaction_id) ON DELETE CASCADE,
    amount_paid NUMERIC(12,2) NOT NULL,
    method TEXT CHECK (method IN ('upi','card','netbanking','cash')) NOT NULL,
    gateway VARCHAR(50),
    gateway_transaction_id VARCHAR(255),
    payment_status VARCHAR(20) DEFAULT 'pending',
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_logs (
    log_id SERIAL PRIMARY KEY,
    payment_id INTEGER REFERENCES payments(payment_id) ON DELETE CASCADE,
    transaction_id INTEGER REFERENCES transactions(transaction_id) ON DELETE CASCADE,
    gateway_response JSONB,
    status VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS saved_properties (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    property_id INTEGER NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, property_id)
);

CREATE TABLE IF NOT EXISTS notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
    review_id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(property_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS property_views (
    view_id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(property_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    ip_address VARCHAR(45),
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS search_logs (
    search_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    search_query TEXT,
    city VARCHAR(100),
    min_price NUMERIC,
    max_price NUMERIC,
    property_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS featured_properties (
    featured_id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(property_id) ON DELETE CASCADE,
    featured_start TIMESTAMP,
    featured_end TIMESTAMP,
    priority INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS loan_applications (
    loan_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    property_id INTEGER REFERENCES properties(property_id) ON DELETE CASCADE,
    loan_amount NUMERIC NOT NULL,
    annual_income NUMERIC,
    employment_type VARCHAR(50),
    loan_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS otp_verifications (
    otp_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    mobile VARCHAR(15),
    otp_code VARCHAR(10),
    expires_at TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_preferences (
    preference_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    preferred_city VARCHAR(100),
    preferred_type VARCHAR(50),
    min_budget NUMERIC,
    max_budget NUMERIC,
    bedrooms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS property_comparisons (
    comparison_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    property_id INTEGER REFERENCES properties(property_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, property_id)
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(user_email);
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_property_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_property_type ON properties(type);
CREATE INDEX IF NOT EXISTS idx_property_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_property_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_property_documents_property_id ON property_documents(property_id);
CREATE INDEX IF NOT EXISTS idx_user_documents_user_id ON user_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_property_id ON bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_booking_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_transactions_property_id ON transactions(property_id);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller_id ON transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_property_id ON reviews(property_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_user ON saved_properties(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_property ON saved_properties(property_id);
CREATE INDEX IF NOT EXISTS idx_property_views_property ON property_views(property_id);
CREATE INDEX IF NOT EXISTS idx_property_views_user ON property_views(user_id);
CREATE INDEX IF NOT EXISTS idx_search_logs_user ON search_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_search_logs_city ON search_logs(city);
CREATE INDEX IF NOT EXISTS idx_featured_property ON featured_properties(property_id);
CREATE INDEX IF NOT EXISTS idx_loan_user ON loan_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_mobile ON otp_verifications(mobile);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_property_comparisons_user ON property_comparisons(user_id);
CREATE INDEX IF NOT EXISTS idx_property_comparisons_property ON property_comparisons(property_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- Backend uses DATABASE_URL, so policies allow backend access.
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_comparisons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow backend access users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow backend access properties" ON properties FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow backend access bookings" ON bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow backend access transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow backend access payments" ON payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow backend access payment_logs" ON payment_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow backend access notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow backend access reviews" ON reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow backend access saved_properties" ON saved_properties FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow backend access property_images" ON property_images FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow backend access property_documents" ON property_documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow backend access user_documents" ON user_documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow backend access contact_messages" ON contact_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow backend access property_views" ON property_views FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow backend access search_logs" ON search_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow backend access featured_properties" ON featured_properties FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow backend access loan_applications" ON loan_applications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow backend access user_preferences" ON user_preferences FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow backend access otp_verifications" ON otp_verifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow backend access property_comparisons" ON property_comparisons FOR ALL USING (true) WITH CHECK (true);


-- =====================================================
-- REMS FULL DEMO DATA FOR PRESENTATION
-- 20 USERS + 20 PROPERTIES + 20 PROPERTY IMAGES
-- All demo users password = Test@1234
-- Password hash is copied from seller@test.com
-- =====================================================

BEGIN;

-- =====================================================
-- 0) SAFETY CHECK: seller@test.com must exist
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM users WHERE user_email = 'seller@test.com'
  ) THEN
    RAISE EXCEPTION 'seller@test.com not found. First create/login seller@test.com with password Test@1234, then run this SQL.';
  END IF;
END $$;

-- =====================================================
-- 1) OPTIONAL CLEANUP: Remove old demo users/properties
-- This only removes demo users with @remsdemo.com emails.
-- It will NOT delete your tested seller@test.com, buyer@test.com, or admin.
-- =====================================================

DELETE FROM users
WHERE user_email LIKE '%@remsdemo.com';

-- =====================================================
-- 2) INSERT 20 DEMO USERS
-- 8 sellers + 6 agents + 6 buyers
-- All use same password hash as seller@test.com
-- =====================================================

WITH demo_pass AS (
  SELECT password AS hash
  FROM users
  WHERE user_email = 'seller@test.com'
  LIMIT 1
)
INSERT INTO users (
  user_name,
  user_email,
  user_mobile,
  password,
  role,
  is_active,
  is_mobile_verified
)
SELECT 
  v.user_name,
  v.user_email,
  v.user_mobile,
  demo_pass.hash,
  v.role,
  TRUE,
  TRUE
FROM demo_pass
CROSS JOIN (
  VALUES
  -- Sellers
  ('Aarav Patel',      'seller01@remsdemo.com', '9000000001', 'seller'),
  ('Nisha Shah',       'seller02@remsdemo.com', '9000000002', 'seller'),
  ('Rohan Mehta',      'seller03@remsdemo.com', '9000000003', 'seller'),
  ('Priya Desai',      'seller04@remsdemo.com', '9000000004', 'seller'),
  ('Kunal Trivedi',    'seller05@remsdemo.com', '9000000005', 'seller'),
  ('Meera Joshi',      'seller06@remsdemo.com', '9000000006', 'seller'),
  ('Harsh Vyas',       'seller07@remsdemo.com', '9000000007', 'seller'),
  ('Sneha Parmar',     'seller08@remsdemo.com', '9000000008', 'seller'),

  -- Agents
  ('Raj Estate Agency',      'agent01@remsdemo.com', '9100000001', 'agent'),
  ('Prime Property Agent',   'agent02@remsdemo.com', '9100000002', 'agent'),
  ('Urban Nest Realtors',    'agent03@remsdemo.com', '9100000003', 'agent'),
  ('Green City Realtors',    'agent04@remsdemo.com', '9100000004', 'agent'),
  ('Skyline Property Hub',   'agent05@remsdemo.com', '9100000005', 'agent'),
  ('Trust Realty Services',  'agent06@remsdemo.com', '9100000006', 'agent'),

  -- Buyers
  ('Demo Buyer One',    'buyer01@remsdemo.com', '9200000001', 'buyer'),
  ('Demo Buyer Two',    'buyer02@remsdemo.com', '9200000002', 'buyer'),
  ('Demo Buyer Three',  'buyer03@remsdemo.com', '9200000003', 'buyer'),
  ('Demo Buyer Four',   'buyer04@remsdemo.com', '9200000004', 'buyer'),
  ('Demo Buyer Five',   'buyer05@remsdemo.com', '9200000005', 'buyer'),
  ('Demo Buyer Six',    'buyer06@remsdemo.com', '9200000006', 'buyer')
) AS v(user_name, user_email, user_mobile, role)
ON CONFLICT (user_email) DO NOTHING;

-- =====================================================
-- 3) INSERT 20 DEMO PROPERTIES
-- Owned by sellers and agents
-- =====================================================

WITH owners AS (
  SELECT user_id, user_email
  FROM users
  WHERE user_email IN (
    'seller01@remsdemo.com',
    'seller02@remsdemo.com',
    'seller03@remsdemo.com',
    'seller04@remsdemo.com',
    'seller05@remsdemo.com',
    'seller06@remsdemo.com',
    'seller07@remsdemo.com',
    'seller08@remsdemo.com',
    'agent01@remsdemo.com',
    'agent02@remsdemo.com',
    'agent03@remsdemo.com',
    'agent04@remsdemo.com',
    'agent05@remsdemo.com',
    'agent06@remsdemo.com'
  )
),
property_seed AS (
  SELECT *
  FROM (
    VALUES
    (
      'seller01@remsdemo.com',
      'Skyline Luxury 3 BHK Apartment',
      'Premium 3 BHK apartment with modular kitchen, balcony, lift, gym, security, and excellent city connectivity.',
      'apartment',
      'sale',
      3,
      2,
      1450,
      'Satellite Road, Near ISKCON Cross Road',
      'Ahmedabad',
      'Gujarat',
      '380015',
      8500000,
      '["parking","gym","security","lift","garden"]'::jsonb,
      23.0225,
      72.5714,
      64,
      'images/img1.jpg'
    ),
    (
      'seller02@remsdemo.com',
      'Modern Family House in Vesu',
      'Spacious independent family house located near school, hospital, shopping mall, and public transport.',
      'house',
      'sale',
      4,
      3,
      1800,
      'Vesu Main Road',
      'Surat',
      'Gujarat',
      '395007',
      9500000,
      '["parking","security","garden","clubhouse"]'::jsonb,
      21.1702,
      72.8311,
      58,
      'images/img2.jpg'
    ),
    (
      'seller03@remsdemo.com',
      'Affordable 2 BHK Flat in Alkapuri',
      'Budget friendly 2 BHK flat for small families with parking, lift, and 24x7 security.',
      'apartment',
      'sale',
      2,
      2,
      950,
      'Alkapuri Society',
      'Vadodara',
      'Gujarat',
      '390007',
      4200000,
      '["parking","lift","security"]'::jsonb,
      22.3072,
      73.1812,
      41,
      'images/img3.jpg'
    ),
    (
      'agent01@remsdemo.com',
      'Prime Office Space on Kalawad Road',
      'Commercial office space suitable for startup, consultancy, coaching center, or professional office.',
      'commercial',
      'rent',
      0,
      2,
      1300,
      'Kalawad Road',
      'Rajkot',
      'Gujarat',
      '360005',
      45000,
      '["parking","security","lift","power_backup"]'::jsonb,
      22.3039,
      70.8022,
      37,
      'images/img4.jpg'
    ),
    (
      'seller04@remsdemo.com',
      'Premium Garden Villa in Kudasan',
      'Luxury villa with private garden, premium flooring, large rooms, and peaceful surroundings.',
      'villa',
      'sale',
      5,
      4,
      3200,
      'Kudasan, Near Gift City Road',
      'Gandhinagar',
      'Gujarat',
      '382421',
      18000000,
      '["parking","garden","security","clubhouse","swimming_pool"]'::jsonb,
      23.2156,
      72.6369,
      79,
      'images/img5.jpg'
    ),
    (
      'agent02@remsdemo.com',
      'Compact 1 BHK Rental Apartment',
      'Affordable rental apartment suitable for students and working professionals.',
      'apartment',
      'rent',
      1,
      1,
      550,
      'Navrangpura, Near University Area',
      'Ahmedabad',
      'Gujarat',
      '380009',
      15000,
      '["lift","security","water_supply"]'::jsonb,
      23.0365,
      72.5611,
      52,
      'images/img6.jpg'
    ),
    (
      'seller05@remsdemo.com',
      '3 BHK Apartment Near Metro Station',
      'Well-connected apartment near metro station, shopping complex, school, and hospital.',
      'apartment',
      'sale',
      3,
      3,
      1600,
      'Bopal Main Road',
      'Ahmedabad',
      'Gujarat',
      '380058',
      7800000,
      '["parking","gym","lift","security","garden"]'::jsonb,
      23.0339,
      72.4637,
      46,
      'images/img7.jpg'
    ),
    (
      'seller06@remsdemo.com',
      'Independent House in Bhavnagar',
      'Independent residential house with open area, garden space, and peaceful locality.',
      'house',
      'sale',
      3,
      2,
      1500,
      'Waghawadi Road',
      'Bhavnagar',
      'Gujarat',
      '364002',
      6200000,
      '["parking","garden","water_supply"]'::jsonb,
      21.7645,
      72.1519,
      29,
      'images/img8.jpg'
    ),
    (
      'agent03@remsdemo.com',
      'High Footfall Shop for Rent',
      'Commercial shop in busy market area suitable for retail, showroom, or service business.',
      'commercial',
      'rent',
      0,
      1,
      450,
      'Ring Road Market',
      'Surat',
      'Gujarat',
      '395002',
      30000,
      '["security","main_road","water_supply"]'::jsonb,
      21.1959,
      72.8302,
      33,
      'images/img9.jpg'
    ),
    (
      'seller07@remsdemo.com',
      'Luxury Villa in Gotri',
      'High-end villa with elegant interiors, premium construction, parking, gym, and garden.',
      'villa',
      'sale',
      4,
      4,
      2800,
      'Gotri Road',
      'Vadodara',
      'Gujarat',
      '390021',
      15500000,
      '["parking","garden","gym","security","clubhouse"]'::jsonb,
      22.3180,
      73.1450,
      71,
      'images/img10.jpg'
    ),
    (
      'seller08@remsdemo.com',
      'Budget Home in Mavdi',
      'Affordable house for first-time home buyers with basic facilities and good neighborhood.',
      'house',
      'sale',
      2,
      1,
      850,
      'Mavdi Main Road',
      'Rajkot',
      'Gujarat',
      '360004',
      3500000,
      '["parking","water_supply"]'::jsonb,
      22.2736,
      70.7512,
      26,
      'images/img11.jpg'
    ),
    (
      'agent04@remsdemo.com',
      'Sea View Apartment near Dumas',
      'Premium apartment close to Dumas Road with spacious rooms and excellent lifestyle amenities.',
      'apartment',
      'sale',
      3,
      3,
      1700,
      'Dumas Road',
      'Surat',
      'Gujarat',
      '395007',
      11000000,
      '["parking","gym","security","lift","garden"]'::jsonb,
      21.1420,
      72.7560,
      57,
      'images/img12.jpg'
    ),
    (
      'agent05@remsdemo.com',
      'Student Rental Room near CG Road',
      'Affordable rental room option for students and working professionals near college and bus stop.',
      'house',
      'rent',
      1,
      1,
      350,
      'CG Road',
      'Ahmedabad',
      'Gujarat',
      '380009',
      8000,
      '["security","water_supply"]'::jsonb,
      23.0260,
      72.5570,
      44,
      'images/img13.jpg'
    ),
    (
      'agent06@remsdemo.com',
      'Corporate Office in Fatehgunj',
      'Ready-to-use commercial office space with modern interiors, conference area, and reception.',
      'commercial',
      'rent',
      0,
      2,
      2000,
      'Fatehgunj Main Road',
      'Vadodara',
      'Gujarat',
      '390002',
      75000,
      '["parking","lift","security","power_backup"]'::jsonb,
      22.3230,
      73.1880,
      35,
      'images/img14.jpg'
    ),
    (
      'seller01@remsdemo.com',
      'Farm Style Villa in Sargasan',
      'Spacious villa with farmhouse feel, garden, open space, and premium construction quality.',
      'villa',
      'sale',
      4,
      3,
      3500,
      'Sargasan',
      'Gandhinagar',
      'Gujarat',
      '382421',
      21000000,
      '["parking","garden","security","clubhouse"]'::jsonb,
      23.1900,
      72.6100,
      83,
      'images/img15.jpg'
    ),
    (
      'seller02@remsdemo.com',
      '2 BHK Apartment in Naroda',
      'Good apartment for family living with lift, parking, and easy access to market.',
      'apartment',
      'sale',
      2,
      2,
      1000,
      'Naroda Road',
      'Ahmedabad',
      'Gujarat',
      '382330',
      3900000,
      '["parking","lift","security"]'::jsonb,
      23.0700,
      72.6600,
      38,
      'images/img16.jpg'
    ),
    (
      'seller03@remsdemo.com',
      'Premium House in Jamnagar',
      'Beautiful residential house in developed area with garden and parking facility.',
      'house',
      'sale',
      3,
      2,
      1400,
      'Patel Colony',
      'Jamnagar',
      'Gujarat',
      '361008',
      5800000,
      '["parking","garden","security"]'::jsonb,
      22.4707,
      70.0577,
      31,
      'images/img17.jpg'
    ),
    (
      'agent01@remsdemo.com',
      'Small Office Space in Maninagar',
      'Budget commercial office space for small business, service center, or consultancy.',
      'commercial',
      'rent',
      0,
      1,
      600,
      'Maninagar',
      'Ahmedabad',
      'Gujarat',
      '380008',
      22000,
      '["security","lift","water_supply"]'::jsonb,
      22.9960,
      72.6000,
      24,
      'images/img18.jpg'
    ),
    (
      'agent02@remsdemo.com',
      'Elegant Villa in Adajan',
      'Luxury villa suitable for premium lifestyle with modern amenities and peaceful locality.',
      'villa',
      'sale',
      4,
      4,
      3000,
      'Adajan',
      'Surat',
      'Gujarat',
      '395009',
      17500000,
      '["parking","garden","gym","security","clubhouse"]'::jsonb,
      21.1950,
      72.7900,
      66,
      'images/img19.jpg'
    ),
    (
      'agent03@remsdemo.com',
      'Rental Flat on Yagnik Road',
      '2 BHK rental flat with easy access to city center, shopping area, and transport.',
      'apartment',
      'rent',
      2,
      2,
      900,
      'Yagnik Road',
      'Rajkot',
      'Gujarat',
      '360001',
      18000,
      '["parking","security","lift"]'::jsonb,
      22.2910,
      70.7930,
      28,
      'images/img20.jpg'
    )
  ) AS p(
    owner_email,
    title,
    description,
    type,
    listing_type,
    bedrooms,
    bathrooms,
    area,
    address,
    city,
    state,
    pincode,
    price,
    amenities,
    latitude,
    longitude,
    views,
    image_url
  )
),
inserted_properties AS (
  INSERT INTO properties (
    owner_id,
    title,
    description,
    type,
    listing_type,
    bedrooms,
    bathrooms,
    area,
    address,
    city,
    state,
    pincode,
    price,
    status,
    verification_status,
    amenities,
    latitude,
    longitude,
    views
  )
  SELECT
    owners.user_id,
    property_seed.title,
    property_seed.description,
    property_seed.type,
    property_seed.listing_type,
    property_seed.bedrooms,
    property_seed.bathrooms,
    property_seed.area,
    property_seed.address,
    property_seed.city,
    property_seed.state,
    property_seed.pincode,
    property_seed.price,
    'available',
    'approved',
    property_seed.amenities,
    property_seed.latitude,
    property_seed.longitude,
    property_seed.views
  FROM property_seed
  JOIN owners ON owners.user_email = property_seed.owner_email
  WHERE NOT EXISTS (
    SELECT 1
    FROM properties existing
    WHERE existing.title = property_seed.title
      AND existing.city = property_seed.city
      AND existing.address = property_seed.address
  )
  RETURNING property_id, title, city, address
)
INSERT INTO property_images (property_id, image_url)
SELECT 
  inserted_properties.property_id,
  property_seed.image_url
FROM inserted_properties
JOIN property_seed 
  ON property_seed.title = inserted_properties.title
 AND property_seed.city = inserted_properties.city
 AND property_seed.address = inserted_properties.address;

-- =====================================================
-- 4) ADD APPROVED USER KYC DOCUMENTS FOR DEMO USERS
-- =====================================================

INSERT INTO user_documents (user_id, document_type, document_url, status)
SELECT 
  user_id,
  'aadhar',
  '/uploads/documents/demo-aadhar.pdf',
  'approved'
FROM users
WHERE user_email LIKE '%@remsdemo.com'
ON CONFLICT DO NOTHING;

-- =====================================================
-- 5) ADD APPROVED PROPERTY DOCUMENTS FOR DEMO PROPERTIES
-- =====================================================

INSERT INTO property_documents (property_id, document_type, document_url, status)
SELECT 
  property_id,
  'ownership_proof',
  '/uploads/documents/demo-ownership-proof.pdf',
  'approved'
FROM properties
WHERE title IN (
  'Skyline Luxury 3 BHK Apartment',
  'Modern Family House in Vesu',
  'Affordable 2 BHK Flat in Alkapuri',
  'Prime Office Space on Kalawad Road',
  'Premium Garden Villa in Kudasan',
  'Compact 1 BHK Rental Apartment',
  '3 BHK Apartment Near Metro Station',
  'Independent House in Bhavnagar',
  'High Footfall Shop for Rent',
  'Luxury Villa in Gotri',
  'Budget Home in Mavdi',
  'Sea View Apartment near Dumas',
  'Student Rental Room near CG Road',
  'Corporate Office in Fatehgunj',
  'Farm Style Villa in Sargasan',
  '2 BHK Apartment in Naroda',
  'Premium House in Jamnagar',
  'Small Office Space in Maninagar',
  'Elegant Villa in Adajan',
  'Rental Flat on Yagnik Road'
)
ON CONFLICT DO NOTHING;

COMMIT;