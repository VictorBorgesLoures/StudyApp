-- When file is upload to db try to create db;
CREATE DATABASE IF NOT EXISTS `studyapp` CHARACTER SET=`utf8`;

-- use current database studyapp
USE `studyapp`;

-- Create Users Table;
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(80) NOT NULL UNIQUE,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `is_admin` TINYINT DEFAULT 0,
  `cookie` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `users_data` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `data` TEXT NOT NULL DEFAULT '',
  FOREIGN KEY(`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB;

-- Create table subjects
CREATE TABLE IF NOT EXISTS `subjects` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `parent_id` INT DEFAULT NULL,
  `name` VARCHAR(255) NOT NULL,
  `user_id` INT NOT NULL,
  FOREIGN KEY(`user_id`) REFERENCES `users` (`id`),
  FOREIGN KEY(`parent_id`) REFERENCES `subjects` (`id`)
) ENGINE=InnoDB;

-- Create table subjects_card
CREATE TABLE IF NOT EXISTS `subjects_card` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `subject_id` INT NOT NULL,
  `title` VARCHAR(500) NOT NULL,
  `summary` TEXT DEFAULT NULL,
  `text` TEXT DEFAULT NULL,
  `last_review_date`  DATETIME DEFAULT CURRENT_TIMESTAMP,
  `review_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(`subject_id`) REFERENCES `subjects` (`id`),
  FOREIGN KEY(`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB;

-- Create table subjects_card_question
CREATE TABLE IF NOT EXISTS `subjects_card_question` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `subject_card_id` INT NOT NULL,
  `question` TEXT DEFAULT NULL,
  `answer` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(`subject_card_id`) REFERENCES `subjects_card` (`id`),
  FOREIGN KEY(`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB;