-- Create tables manually to avoid migration circular dependency

-- User table
CREATE TABLE IF NOT EXISTS user_auth_user (
    id BIGSERIAL PRIMARY KEY,
    password VARCHAR(128) NOT NULL,
    last_login TIMESTAMP,
    is_superuser BOOLEAN DEFAULT FALSE,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(254),
    first_name VARCHAR(150),
    last_name VARCHAR(150),
    partnership_number VARCHAR(50),
    user_type VARCHAR(20) DEFAULT 'member',
    otp VARCHAR(10),
    is_verified BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_staff BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Category table
CREATE TABLE IF NOT EXISTS business_category (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- Business table
CREATE TABLE IF NOT EXISTS business_business (
    id UUID PRIMARY KEY,
    user_id BIGINT REFERENCES user_auth_user(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES business_category(id) ON DELETE SET NULL,
    business_name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    rating DECIMAL(3,2) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product table
CREATE TABLE IF NOT EXISTS business_product (
    id BIGSERIAL PRIMARY KEY,
    business_id UUID REFERENCES business_business(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    price_currency VARCHAR(10) DEFAULT 'KES',
    product_image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    in_stock BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service table
CREATE TABLE IF NOT EXISTS business_service (
    id BIGSERIAL PRIMARY KEY,
    business_id UUID REFERENCES business_business(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price_range VARCHAR(100),
    duration VARCHAR(100),
    service_image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Review table
CREATE TABLE IF NOT EXISTS business_review (
    id BIGSERIAL PRIMARY KEY,
    business_id UUID REFERENCES business_business(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES user_auth_user(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES business_product(id) ON DELETE CASCADE,
    service_id BIGINT REFERENCES business_service(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL,
    review_text TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Role table
CREATE TABLE IF NOT EXISTS user_roles_role (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- UserRole table  
CREATE TABLE IF NOT EXISTS user_roles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES user_auth_user(id) ON DELETE CASCADE,
    role_id BIGINT REFERENCES user_roles_role(id) ON DELETE CASCADE,
    assigned_by_id BIGINT REFERENCES user_auth_user(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role_id)
);

-- Django migrations table (to mark migrations as applied)
CREATE TABLE IF NOT EXISTS django_migrations (
    id SERIAL PRIMARY KEY,
    app VARCHAR(255),
    name VARCHAR(255),
    applied TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mark all migrations as applied
INSERT INTO django_migrations (app, name) VALUES
('contenttypes', '0001_initial'),
('contenttypes', '0002_remove_content_type_name'),
('api', '0001_initial'),
('auth', '0001_initial'),
('auth', '0002_alter_permission_name_max_length'),
('auth', '0003_alter_user_email_max_length'),
('auth', '0004_alter_user_username_opts'),
('auth', '0005_alter_user_last_login_null'),
('auth', '0006_require_contenttypes_0002'),
('auth', '0007_alter_validators_add_error_messages'),
('auth', '0008_alter_user_username_max_length'),
('auth', '0009_alter_user_last_name_max_length'),
('auth', '0010_alter_group_name_max_length'),
('auth', '0011_update_proxy_permissions'),
('auth', '0012_alter_user_first_name_max_length'),
('admin', '0001_initial'),
('admin', '0002_logentry_remove_auto_add'),
('admin', '0003_logentry_add_action_flag_choices'),
('sessions', '0001_initial')
ON CONFLICT DO NOTHING;
