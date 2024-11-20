-- Create operators table
CREATE TABLE operators (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    company_name VARCHAR(100),
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create buses table with reference to operators
CREATE TABLE buses (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE SET NULL,
    bus_number VARCHAR(20) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL,
    capacity INTEGER NOT NULL,
    last_maintenance DATE,
    next_maintenance DATE,
    staff_assigned BOOLEAN DEFAULT FALSE
);

-- Create routes table
CREATE TABLE routes (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    source VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL
);

-- Create stops table
CREATE TABLE stops (
    id SERIAL PRIMARY KEY,
    route_id INTEGER REFERENCES routes(id) ON DELETE CASCADE,
    stop_name VARCHAR(100) NOT NULL,
    stop_order INTEGER NOT NULL
);

-- Create schedules table
CREATE TABLE schedules (
    id SERIAL PRIMARY KEY,
    bus_id INTEGER REFERENCES buses(id) ON DELETE CASCADE,
    route_id INTEGER REFERENCES routes(id) ON DELETE CASCADE,
    departure TIMESTAMP WITH TIME ZONE,
    arrival TIMESTAMP WITH TIME ZONE,
    available_seats INTEGER NOT NULL
);

-- Create bookings table
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    schedule_id INTEGER REFERENCES schedules(id) ON DELETE CASCADE,
    passenger_name VARCHAR(100) NOT NULL,
    passenger_email VARCHAR(100) NOT NULL,
    seats_booked INTEGER NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_price DECIMAL(10, 2) DEFAULT 0.00,
    payment_status VARCHAR(20) DEFAULT 'PENDING',
    ADD COLUMN reminder_enabled BOOLEAN DEFAULT FALSE,
    ADD COLUMN reminder_time INTEGER;
);

-- Create staff table
CREATE TABLE staff (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    license_number VARCHAR(50) UNIQUE,
    employment_date DATE NOT NULL
);

-- Create roles table for different roles (e.g., driver, conductor)
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

-- Create staff_roles table to handle staff roles (many-to-many relationship)
CREATE TABLE staff_roles (
    staff_id INTEGER REFERENCES staff(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (staff_id, role_id)
);

-- Create bus_assignments table to assign staff to buses with specific roles
CREATE TABLE bus_assignments (
    id SERIAL PRIMARY KEY,
    bus_id INTEGER REFERENCES buses(id) ON DELETE CASCADE,
    staff_id INTEGER REFERENCES staff(id) ON DELETE CASCADE,
    assignment_date DATE NOT NULL,
    role_id INTEGER REFERENCES roles(id)
);

-- Create maintenance_records table
CREATE TABLE maintenance_records (
    id SERIAL PRIMARY KEY,
    bus_id INTEGER REFERENCES buses(id) ON DELETE CASCADE,
    maintenance_date DATE NOT NULL,
    description TEXT,
    cost DECIMAL(10, 2) NOT NULL
);

-- Create fuel_records table for tracking fuel usage
CREATE TABLE fuel_records (
    id SERIAL PRIMARY KEY,
    bus_id INTEGER REFERENCES buses(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    fuel_amount DECIMAL(10, 2) NOT NULL,
    fuel_cost DECIMAL(10, 2) NOT NULL
);

CREATE TABLE fare (
    id SERIAL PRIMARY KEY,
    bus_id INTEGER REFERENCES buses(id) ON DELETE CASCADE,
    start_stop_id INTEGER REFERENCES stops(id) ON DELETE CASCADE,
    end_stop_id INTEGER REFERENCES stops(id) ON DELETE CASCADE,
    base_fare DECIMAL(10, 2) NOT NULL,
    per_km_rate DECIMAL(5, 2),
    per_stop_rate DECIMAL(5, 2)
);


CREATE TABLE distances (
    route_id INTEGER REFERENCES routes(id) ON DELETE CASCADE,
    from_stop VARCHAR(100),
    to_stop VARCHAR(100),
    distance_km DECIMAL(5, 2),
    PRIMARY KEY (route_id, from_stop, to_stop)
);

CREATE TABLE user_accounts (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'operator')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);




CREATE TABLE bus_staff_assignments (
    id SERIAL PRIMARY KEY,
    bus_id INTEGER REFERENCES buses(id) ON DELETE CASCADE,
    driver_id INTEGER REFERENCES staff(id),
    conductor_id INTEGER REFERENCES staff(id),
    cleaner_id INTEGER REFERENCES staff(id),
    assignment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_bus_assignment UNIQUE (bus_id)
);










