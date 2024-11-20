CREATE OR REPLACE FUNCTION calculate_profitability_index(p_route_id INTEGER, p_start_date DATE, p_end_date DATE)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
    total_revenue DECIMAL(10, 2);
    total_cost DECIMAL(10, 2);
    profitability_index DECIMAL(10, 2);
BEGIN
    -- Calculate total revenue for the given route within the date range
    SELECT COALESCE(SUM(b.total_price), 0) INTO total_revenue
    FROM bookings b
    JOIN schedules s ON b.schedule_id = s.id
    WHERE s.route_id = p_route_id 
    AND b.payment_status = 'PENDING'
    AND s.departure BETWEEN p_start_date AND p_end_date;

    -- Calculate total cost (fuel + maintenance) for the given route within the date range
    SELECT COALESCE(SUM(fr.fuel_cost), 0) + COALESCE(SUM(mr.cost), 0) INTO total_cost
    FROM schedules s
    LEFT JOIN fuel_records fr ON s.bus_id = fr.bus_id AND fr.date BETWEEN p_start_date AND p_end_date
    LEFT JOIN maintenance_records mr ON s.bus_id = mr.bus_id AND mr.maintenance_date BETWEEN p_start_date AND p_end_date
    WHERE s.route_id = p_route_id AND s.departure BETWEEN p_start_date AND p_end_date;

    -- Calculate profitability index (revenue / cost ratio)
    IF total_cost > 0 THEN
        profitability_index := total_revenue / total_cost;
    ELSE
        profitability_index := 0;
    END IF;
    
    RETURN profitability_index;
END;
$$ LANGUAGE plpgsql;





CREATE OR REPLACE FUNCTION calculate_occupancy_rate(p_route_id INTEGER, p_start_date DATE, p_end_date DATE)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
    total_seats_booked INTEGER;
    total_capacity INTEGER;
    occupancy_rate DECIMAL(10, 2);
BEGIN
    -- Calculate total seats booked for the given route within the date range
    SELECT COALESCE(SUM(b.seats_booked), 0) INTO total_seats_booked
    FROM bookings b
    JOIN schedules s ON b.schedule_id = s.id
    WHERE s.route_id = p_route_id
    AND s.departure BETWEEN p_start_date AND p_end_date;

    -- Calculate total capacity for the given route within the date range
    SELECT COALESCE(SUM(bu.capacity), 0) INTO total_capacity
    FROM schedules s
    JOIN buses bu ON s.bus_id = bu.id
    WHERE s.route_id = p_route_id
    AND s.departure BETWEEN p_start_date AND p_end_date;

    -- Calculate occupancy rate
    IF total_capacity > 0 THEN
        occupancy_rate := (total_seats_booked::DECIMAL / total_capacity) * 100;
    ELSE
        occupancy_rate := 0;
    END IF;
    
    RETURN occupancy_rate;
END;
$$ LANGUAGE plpgsql;




CREATE OR REPLACE FUNCTION calculate_avg_revenue_per_route(p_route_id INTEGER, p_start_date DATE, p_end_date DATE)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
    total_revenue DECIMAL(10, 2);
    total_schedules INTEGER;
    avg_revenue DECIMAL(10, 2);
BEGIN
    -- Calculate total revenue for the given route within the date range
    SELECT COALESCE(SUM(b.total_price), 0) INTO total_revenue
    FROM bookings b
    JOIN schedules s ON b.schedule_id = s.id
    WHERE s.route_id = p_route_id 
    AND b.payment_status = 'PENDING'
    AND s.departure BETWEEN p_start_date AND p_end_date;

    -- Get total number of schedules for the route within the date range
    SELECT COUNT(*) INTO total_schedules
    FROM schedules
    WHERE route_id = p_route_id
    AND departure BETWEEN p_start_date AND p_end_date;

    -- Calculate average revenue per schedule
    IF total_schedules > 0 THEN
        avg_revenue := total_revenue / total_schedules;
    ELSE
        avg_revenue := 0;
    END IF;

    RETURN avg_revenue;
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION calculate_fuel_efficiency(p_bus_id INTEGER, p_start_date DATE, p_end_date DATE)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
    total_fuel DECIMAL(10, 2);
    total_distance DECIMAL(10, 2);
    fuel_efficiency DECIMAL(10, 2);
BEGIN
    -- Calculate total fuel usage within the date range
    SELECT COALESCE(SUM(fuel_amount), 0) INTO total_fuel
    FROM fuel_records
    WHERE bus_id = p_bus_id AND date BETWEEN p_start_date AND p_end_date;

    -- Calculate total distance covered by schedules within the date range
    SELECT COALESCE(SUM(d.distance_km), 0) INTO total_distance
    FROM schedules s
    JOIN routes r ON s.route_id = r.id
    JOIN distances d ON r.id = d.route_id AND d.from_stop = r.source AND d.to_stop = r.destination
    WHERE s.bus_id = p_bus_id AND s.departure BETWEEN p_start_date AND p_end_date;

    -- Calculate fuel efficiency (distance per fuel unit)
    IF total_fuel > 0 THEN
        fuel_efficiency := total_distance / total_fuel;
    ELSE
        fuel_efficiency := 0;
    END IF;
    
    RETURN fuel_efficiency;
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION calculate_utilization_rate(p_role_id INTEGER, p_start_date DATE, p_end_date DATE)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
    total_assignments INTEGER DEFAULT 0;
    total_staff INTEGER DEFAULT 0;
    total_days INTEGER;
    utilization_rate DECIMAL(10, 2) DEFAULT 0;
BEGIN
    -- Check if role_id exists
    IF NOT EXISTS (SELECT 1 FROM roles WHERE id = p_role_id) THEN
        RAISE EXCEPTION 'Role ID % does not exist', p_role_id;
    END IF;

    -- Calculate total assignments for the role within the date range
    SELECT COUNT(*) INTO total_assignments
    FROM bus_staff_assignments bsa
    JOIN staff_roles sr ON bsa.driver_id = sr.staff_id OR bsa.conductor_id = sr.staff_id OR bsa.cleaner_id = sr.staff_id
    WHERE sr.role_id = p_role_id AND bsa.assignment_date BETWEEN p_start_date AND p_end_date;

    -- Calculate total staff with the role
    SELECT COUNT(*) INTO total_staff
    FROM staff_roles
    WHERE role_id = p_role_id;

    -- Calculate total days in the date range
    total_days := p_end_date - p_start_date + 1;

    -- Calculate utilization rate
    IF total_staff > 0 AND total_days > 0 THEN
        utilization_rate := (total_assignments::DECIMAL / (total_staff * total_days)) * 100;
    ELSE
        utilization_rate := 0;
    END IF;

    RETURN utilization_rate;
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION calculate_avg_maintenance_cost(p_bus_id INTEGER, p_start_date DATE, p_end_date DATE)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
    avg_cost DECIMAL(10, 2) DEFAULT 0;
    total_maintenance_records INTEGER DEFAULT 0;
BEGIN
    -- Check if bus_id exists
    IF NOT EXISTS (SELECT 1 FROM buses WHERE id = p_bus_id) THEN
        RAISE EXCEPTION 'Bus ID % does not exist', p_bus_id;
    END IF;

    -- Calculate average maintenance cost within the date range
    SELECT COALESCE(AVG(cost), 0), COUNT(*)
    INTO avg_cost, total_maintenance_records
    FROM maintenance_records
    WHERE bus_id = p_bus_id AND maintenance_date BETWEEN p_start_date AND p_end_date;

    -- Return average cost or 0 if no maintenance records
    RETURN COALESCE(avg_cost, 0);
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION calculate_avg_profit_per_bus(p_bus_id INTEGER, p_start_date DATE, p_end_date DATE)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
    total_revenue DECIMAL(10, 2) DEFAULT 0;
    total_cost DECIMAL(10, 2) DEFAULT 0;
    total_routes INTEGER DEFAULT 0;
    avg_profit DECIMAL(10, 2);
BEGIN
    -- Check if bus_id exists
    IF NOT EXISTS (SELECT 1 FROM buses WHERE id = p_bus_id) THEN
        RAISE EXCEPTION 'Bus ID % does not exist', p_bus_id;
    END IF;

    -- Calculate total revenue from bookings within the date range
    SELECT COALESCE(SUM(b.total_price), 0) INTO total_revenue
    FROM bookings b
    JOIN schedules s ON b.schedule_id = s.id
    WHERE s.bus_id = p_bus_id AND b.payment_status = 'PENDING'
    AND s.departure BETWEEN p_start_date AND p_end_date;

    -- Calculate total cost (fuel + maintenance) within the date range
    SELECT COALESCE(SUM(fr.fuel_cost), 0) + COALESCE(SUM(mr.cost), 0) INTO total_cost
    FROM fuel_records fr
    LEFT JOIN maintenance_records mr ON fr.bus_id = mr.bus_id
    WHERE fr.bus_id = p_bus_id 
    AND (fr.date BETWEEN p_start_date AND p_end_date OR mr.maintenance_date BETWEEN p_start_date AND p_end_date);

    -- Calculate total unique routes served by the bus within the date range
    SELECT COUNT(DISTINCT route_id) INTO total_routes
    FROM schedules
    WHERE bus_id = p_bus_id AND departure BETWEEN p_start_date AND p_end_date;

    -- Calculate average profit per route
    IF total_routes > 0 THEN
        avg_profit := (total_revenue - total_cost) / total_routes;
    ELSE
        avg_profit := 0;
    END IF;

    RETURN avg_profit;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION public.handle_schedule_deletion()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    -- Check if the deletion is happening before the scheduled arrival
    IF OLD.arrival > CURRENT_TIMESTAMP THEN
        -- If deletion is before arrival, delete the corresponding fuel record
        DELETE FROM fuel_records
        WHERE bus_id = OLD.bus_id AND date = OLD.arrival::date;
    END IF;

    -- If deletion is after arrival, do nothing (fuel record remains)
    RETURN OLD;
END;
$function$;


CREATE OR REPLACE FUNCTION public.handle_new_schedule()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    -- Set initial distance to NULL
    NEW.distance := NULL;

    -- Let the INSERT complete first
    -- Then call the function to update all null distances
    PERFORM update_all_null_distances();

    -- After distances are updated, calculate and store fuel usage
    PERFORM calculate_and_store_fuel_usage(NEW.id);

    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_distances_and_more()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        -- First check if route_id exists in schedules
        IF EXISTS (SELECT 1 FROM schedules WHERE route_id = NEW.route_id) THEN
            -- Update schedules table where route_id matches
            UPDATE schedules
            SET distance = NULL
            WHERE route_id = NEW.route_id;

            -- Call the update_all_null_distances function
            PERFORM update_all_null_distances();
        END IF;

        RETURN NEW;

    ELSIF (TG_OP = 'DELETE') THEN
        -- First check if route_id exists in schedules
        IF EXISTS (SELECT 1 FROM schedules WHERE route_id = OLD.route_id) THEN
            -- Update schedules table where route_id matches
            UPDATE schedules
            SET distance = NULL
            WHERE route_id = OLD.route_id;

            -- Call the update_all_null_distances function
            PERFORM update_all_null_distances();
        END IF;

        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$function$;

