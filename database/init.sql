-- ========================================
-- MOVIX DATABASE: FULL SCRIPT
-- ========================================
CREATE DATABASE movix_db;
USE movix_db;

-- Drop tables if they exist
DROP TABLE IF EXISTS Devices, Reviews, Watch_History, Content, Users, Subscriptions;

-- ========================================
-- 1. SUBSCRIPTIONS TABLE
-- ========================================
CREATE TABLE Subscriptions (
    subscription_id INT AUTO_INCREMENT PRIMARY KEY,
    plan_name VARCHAR(50) NOT NULL,
    monthly_cost DECIMAL(6,2) NOT NULL,
    max_devices INT NOT NULL
);

-- Sample Data
INSERT INTO Subscriptions (plan_name, monthly_cost, max_devices) VALUES
('Basic', 5.99, 1),
('Standard', 9.99, 2),
('Premium', 14.99, 4);

-- ========================================
-- 2. USERS TABLE
-- ========================================
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    subscription_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subscription_id) REFERENCES Subscriptions(subscription_id)
);

-- Sample Data
INSERT INTO Users (username, email, password_hash, date_of_birth, subscription_id) VALUES
('Alice', 'alice@example.com', 'hash1', '1995-01-15', 1),
('Bob', 'bob@example.com', 'hash2', '1990-07-22', 2),
('Charlie', 'charlie@example.com', 'hash3', '1988-03-10', 3);

-- ========================================
-- 3. CONTENT TABLE
-- ========================================
CREATE TABLE Content (
    content_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content_type ENUM('Movie','TV Show') NOT NULL,
    genre VARCHAR(50),
    release_year YEAR,
    duration_minutes INT,
    rating DECIMAL(3,1) DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sample Data
INSERT INTO Content (title, content_type, genre, release_year, duration_minutes) VALUES
('Inception','Movie','Sci-Fi',2010,148),
('The Dark Knight','Movie','Action',2008,152),
('Stranger Things','TV Show','Mystery',2016,50),
('Breaking Bad','TV Show','Crime',2008,47);

-- ========================================
-- 4. WATCH_HISTORY TABLE
-- ========================================
CREATE TABLE Watch_History (
    watch_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    content_id INT,
    watched_on DATETIME DEFAULT CURRENT_TIMESTAMP,
    watch_duration_minutes INT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (content_id) REFERENCES Content(content_id)
);

-- Sample Data
INSERT INTO Watch_History (user_id, content_id, watch_duration_minutes) VALUES
(1,1,148),(1,3,50),(2,2,152),(2,4,47),(3,1,148),(3,2,152);

-- ========================================
-- 5. REVIEWS TABLE
-- ========================================
CREATE TABLE Reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    content_id INT,
    rating INT CHECK(rating BETWEEN 1 AND 5),
    review_text TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (content_id) REFERENCES Content(content_id)
);

-- Sample Data
INSERT INTO Reviews (user_id, content_id, rating, review_text) VALUES
(1,1,5,'Amazing movie!'),
(2,2,4,'Great action scenes.'),
(3,1,4,'Mind-bending.'),
(1,3,5,'Loved the mystery!');

-- ========================================
-- 6. DEVICES TABLE
-- ========================================
CREATE TABLE Devices (
    device_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    device_type VARCHAR(50),
    device_name VARCHAR(100),
    last_used DATETIME,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Sample Data
INSERT INTO Devices (user_id, device_type, device_name, last_used) VALUES
(1,'Mobile','Alice Phone',NOW()),
(2,'Laptop','Bob Laptop',NOW());

-- ========================================
-- 7. INDEXES
-- ========================================
CREATE INDEX idx_user ON Watch_History(user_id);
CREATE INDEX idx_content ON Watch_History(content_id);
CREATE INDEX idx_genre ON Content(genre);

-- ========================================
-- 8. TRIGGERS
-- ========================================
DELIMITER $$

-- Update average rating after new review
CREATE TRIGGER update_avg_rating
AFTER INSERT ON Reviews
FOR EACH ROW
BEGIN
    DECLARE avg_rating_val DECIMAL(3,1);

    SELECT AVG(rating) INTO avg_rating_val
    FROM Reviews
    WHERE content_id = NEW.content_id;

    UPDATE Content
    SET rating = avg_rating_val
    WHERE content_id = NEW.content_id;
END$$

-- Limit number of devices per subscription
CREATE TRIGGER check_device_limit
BEFORE INSERT ON Devices
FOR EACH ROW
BEGIN
    DECLARE device_count INT;

    SELECT COUNT(*) INTO device_count
    FROM Devices
    WHERE user_id = NEW.user_id;

    IF device_count >= (SELECT max_devices 
                        FROM Subscriptions s
                        JOIN Users u ON u.subscription_id = s.subscription_id
                        WHERE u.user_id = NEW.user_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Device limit exceeded.';
    END IF;
END$$

DELIMITER ;

-- ========================================
-- 9. FUNCTIONS
-- ========================================
DELIMITER $$

-- Average watch time of a user
CREATE FUNCTION avg_watch_time(u_id INT)
RETURNS DECIMAL(6,2)
DETERMINISTIC
BEGIN
    DECLARE avg_time DECIMAL(6,2);
    SELECT AVG(watch_duration_minutes) INTO avg_time
    FROM Watch_History
    WHERE user_id = u_id;
    RETURN IFNULL(avg_time,0);
END$$

-- Get subscription name of user
CREATE FUNCTION subscription_name(u_id INT)
RETURNS VARCHAR(50)
DETERMINISTIC
BEGIN
    DECLARE plan_name VARCHAR(50);
    SELECT s.plan_name INTO plan_name
    FROM Users u
    JOIN Subscriptions s ON u.subscription_id = s.subscription_id
    WHERE u.user_id = u_id;
    RETURN plan_name;
END$$

DELIMITER ;

-- ========================================
-- 10. STORED PROCEDURES
-- ========================================
DELIMITER $$

-- Add new user
CREATE PROCEDURE add_user(
    IN p_username VARCHAR(50),
    IN p_email VARCHAR(100),
    IN p_password VARCHAR(255),
    IN p_subscription_id INT
)
BEGIN
    INSERT INTO Users (username, email, password_hash, subscription_id)
    VALUES (p_username, p_email, p_password, p_subscription_id);
END$$

-- Top rated content by genre
CREATE PROCEDURE top_rated_by_genre(IN p_genre VARCHAR(50))
BEGIN
    SELECT title, rating
    FROM Content
    WHERE genre = p_genre
    ORDER BY rating DESC
    LIMIT 10;
END$$

-- Cursor: Total watch time per user
CREATE PROCEDURE user_watch_report()
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE u_id INT;
    DECLARE u_name VARCHAR(50);
    DECLARE total_time INT;

    DECLARE user_cursor CURSOR FOR 
        SELECT user_id, username FROM Users;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    OPEN user_cursor;

    read_loop: LOOP
        FETCH user_cursor INTO u_id, u_name;
        IF done THEN
            LEAVE read_loop;
        END IF;

        SELECT SUM(watch_duration_minutes) INTO total_time
        FROM Watch_History
        WHERE user_id = u_id;

        SELECT u_name AS 'Username', IFNULL(total_time,0) AS 'Total Watch Time';
    END LOOP;

    CLOSE user_cursor;
END$$

DELIMITER ;

-- ========================================
-- 11. VIEW FOR TOP USERS
-- ========================================
CREATE VIEW top_users AS
SELECT u.username, SUM(w.watch_duration_minutes) AS total_watch_time
FROM Users u
JOIN Watch_History w ON u.user_id = w.user_id
GROUP BY u.user_id
ORDER BY total_watch_time DESC;