USE rems;
DROP TABLE IF EXISTS contact_messages, notifications, saved_properties, payments, transactions, bookings, property_images, properties, users;
CREATE DATABASE IF NOT EXISTS rems;
USE rems;

-- =============================
-- USERS
-- =============================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,
    user_email VARCHAR(150) UNIQUE NOT NULL,
    user_mobile VARCHAR(15),
    password VARCHAR(255) NOT NULL,
    role ENUM('admin','agent','buyer','seller') DEFAULT 'buyer',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- =============================
-- PROPERTIES
-- =============================
CREATE TABLE properties (
property_id INT AUTO_INCREMENT PRIMARY KEY,

owner_id INT NOT NULL,

title VARCHAR(200) NOT NULL,
description TEXT,

type ENUM('house','apartment','villa','commercial'),

listing_type ENUM('sale','rent') DEFAULT 'sale',

bedrooms INT,
bathrooms INT,
area INT,

address VARCHAR(255),
city VARCHAR(100),
state VARCHAR(100),
pincode VARCHAR(20),

price DECIMAL(12,2),

status ENUM('available','sold','rented') DEFAULT 'available',

verification_status ENUM('pending','approved','rejected') DEFAULT 'pending',

amenities JSON,

latitude DECIMAL(10,8),
longitude DECIMAL(11,8),

views INT DEFAULT 0,

listed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- =============================
-- PROPERTY IMAGES
-- =============================
CREATE TABLE property_images (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,

    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================
-- PROPERTY documents
-- =============================
CREATE TABLE property_documents (
id INT AUTO_INCREMENT PRIMARY KEY,
property_id INT,
document_type VARCHAR(100),
document_url VARCHAR(255),
status ENUM('pending','approved','rejected') DEFAULT 'pending',

FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE
);

-- =============================
-- User documents
-- =============================
CREATE TABLE user_documents (
id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT,
document_type VARCHAR(50),
document_url VARCHAR(255),
status ENUM('pending','approved','rejected') DEFAULT 'pending',

FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- =============================
-- BOOKINGS
-- =============================
CREATE TABLE bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    user_id INT NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Pending','Confirmed','Cancelled') DEFAULT 'Pending',

    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;


-- =============================
-- TRANSACTIONS
-- =============================
CREATE TABLE transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    buyer_id INT NOT NULL,
    seller_id INT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_status ENUM('Pending','Completed','Cancelled') DEFAULT 'Pending',
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (property_id) REFERENCES properties(property_id),
    FOREIGN KEY (buyer_id) REFERENCES users(user_id),
    FOREIGN KEY (seller_id) REFERENCES users(user_id)
) ENGINE=InnoDB;


-- =============================
-- PAYMENTS
-- =============================
CREATE TABLE payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    amount_paid DECIMAL(12,2) NOT NULL,
    method ENUM('UPI','Card','NetBanking','Cash') NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id) ON DELETE CASCADE
) ENGINE=InnoDB;


-- =============================
-- SAVED PROPERTIES
-- =============================
CREATE TABLE saved_properties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    property_id INT NOT NULL,
    UNIQUE(user_id, property_id),

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE
) ENGINE=InnoDB;


-- =============================
-- NOTIFICATIONS
-- =============================
CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE contact_messages (
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(100),
email VARCHAR(100),
message TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================
-- REVIEWS
-- =============================
CREATE TABLE reviews (
review_id INT AUTO_INCREMENT PRIMARY KEY,
property_id INT,
user_id INT,
rating INT,
comment TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

FOREIGN KEY (property_id) REFERENCES properties(property_id),
FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- =============================
-- INDEXES (FOR SEARCH PERFORMANCE)
-- =============================
CREATE INDEX idx_property_city ON properties(city);
CREATE INDEX idx_property_type ON properties(type);
CREATE INDEX idx_property_status ON properties(status);
CREATE INDEX idx_booking_status ON bookings(status);

SHOW TABLES;