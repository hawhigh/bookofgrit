-- ================================================================
-- BOOK OF GRIT — MySQL Database Schema
-- Run this once in phpMyAdmin or via SSH on Hostinger
-- ================================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- Users table (replaces Firestore 'users' collection)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `uid` VARCHAR(64) UNIQUE NOT NULL,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `callsign` VARCHAR(50) DEFAULT '',
  `is_subscriber` TINYINT(1) DEFAULT 0,
  `is_admin` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Purchases (replaces Firestore users.purchased array)
CREATE TABLE IF NOT EXISTS `purchases` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `uid` VARCHAR(64) NOT NULL,
  `item_id` VARCHAR(50) NOT NULL,
  `stripe_session_id` VARCHAR(255) DEFAULT NULL,
  `purchased_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_purchase` (`uid`, `item_id`),
  INDEX `idx_uid` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Chapters / Manuals (replaces Firestore 'chapters' collection)
CREATE TABLE IF NOT EXISTS `chapters` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `chapter_id` VARCHAR(50) UNIQUE NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `price` VARCHAR(20) DEFAULT '$3',
  `description` TEXT DEFAULT '',
  `content` TEXT DEFAULT '',
  `img` TEXT DEFAULT '',
  `pdf_url` TEXT DEFAULT '',
  `border_class` VARCHAR(100) DEFAULT 'border-primary',
  `color_class` VARCHAR(100) DEFAULT 'text-primary',
  `glow` VARCHAR(100) DEFAULT 'glow-cyan',
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Enlistments / Mailing List (replaces Firestore 'enlistments')
CREATE TABLE IF NOT EXISTS `enlistments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `callsign` VARCHAR(100) DEFAULT '',
  `status` VARCHAR(20) DEFAULT 'PENDING',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Support signals / Contact (replaces Firestore 'support_signals')
CREATE TABLE IF NOT EXISTS `support_signals` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `status` VARCHAR(20) DEFAULT 'NEW',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Ticker phrases (replaces Firestore 'ticker' collection)
CREATE TABLE IF NOT EXISTS `ticker` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `text` TEXT NOT NULL,
  `sort_order` INT DEFAULT 0,
  `active` TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Default ticker phrases
INSERT IGNORE INTO `ticker` (`text`, `sort_order`) VALUES
('Build Grit. Build Power. Build Your Future.', 1),
('Mindset First. Success Follows.', 2),
('Discipline Creates Destiny.', 3),
('Turn Vision Into Victory.', 4),
('Luck Favors the Prepared Mind.', 5),
('Your Vibe. Your Focus. Your Growth.', 6),
('Embrace Pressure. Become Unstoppable.', 7),
('From Doubt to Dominance.', 8),
('Growth Is a Daily Decision.', 9),
('GRIT Is the Difference.', 10);

-- Default chapters
INSERT IGNORE INTO `chapters` (`chapter_id`, `name`, `price`, `description`, `content`, `img`, `border_class`, `color_class`, `glow`, `sort_order`) VALUES
('CH_01', 'The Void', '$3', 'A deep dive into the mental state required to start. When you have nothing, you have everything to gain.', 'VOID_PROTOCOL: START_WITH_NOTHING.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsY68-HDaa2jNGV0f03uraeN1eAqz_z6KJdGELGwpfgV_IyaDsmNm2pUIj2CJopuOyrHLGHBhzaFEW4bSg7IwJ-h7tCXv37K4bHeQQNu4xjbR-Z7sIK3rK5CxFi1R4dufN5xFBtACCgXrI4cTbdlMCQMU9S-bVS557EShmVJerHO1WPZR8ZJdEu9rTI-YyCwg2-jTyA3K3D-k0fp3EWETdZu_8J9UFV0AU1nD4uKrflSJ-QCIsg1NLfo7rxfr-nITIal9-FpkOniZB', 'border-primary', 'text-primary', 'glow-cyan', 1),
('CH_02', 'Pain Tolerance', '$3', 'Pain is the only yardstick of progress. Understanding the difference between discomfort and damage.', 'PAIN_PROTOCOL: EMBRACE_THE_BURN.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAuh9yajP2K2UokzC7ClDOOXipnj6G6thi0OzOv94tkXWtGDVl0dEnviC-6576FdKLS31wC_yPy4-nVxK2fqIAhvbecAFRogwdBnmndq16MPdnNr5_abVr8mAfJNY9JZHqNwSr244rPrC4nMj65BOa6xQIBuDDtGkH2yCqKygfBgMDTJsIjfNAVQHU7Gh9tNg-rDao62BLMbp1JKCQsqxqcwcfGZ23gyH72_j5q9Wdnbknj01wxnD0YLK8oDr32VUBlUqCNDB_1xgY0', 'border-fire', 'text-fire', 'glow-orange', 2),
('CH_03', 'Legacy War', '$3', 'What will they say when you are gone? Building something that outlasts your biological existence.', 'LEGACY_PROTOCOL: BUILD_TO_LAST.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuC56kH_70TDlN9SyKgcd-f4074AztZff3B4A2Y04L_KrjaZF8QLytUNtIUD8Kg6a3WO04zeBGmLNAnw2T5tHnlrl2eTF3TzAmiimbqOAWPqYgFWtqkYuilGoC9YSeiixfAMX-L03LY1CIdwk7g_5GLKIyTi6dnsTqO1Uq9KqDKtfu8BqEAOcE66Eg4-tOz1rcDqsF197HDbUfR3v8h3TT-btXDZh8a98tx7-OzEzEReZGr40rMhqOWrQFUQE9u44NT25wi4j_CzHEYw', 'border-neon-magenta', 'text-neon-magenta', 'glow-magenta', 3),
('CH_04', 'Final Stand', '$3', 'The end-game manual. When everything is on the line and exhaustion sets in.', 'STAND_PROTOCOL: NO_DEFEAT.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmffZph4QDexI5jYr49CCmsRxz_ynZIQPdmfDkbLEgj4y7Yi5iVymxj3UTjJp9-N6J_qM7lfY0MaExbUGpf2Y_VveR4yXRoXdmk_S6TI1Bt7y3IFPyPhulf42xH4aFv45FuijLtWH3F7vF8hnHHWYIr5jSAC-IBQVyqhpazomWHorUpw14GC2KAibvKiLoZQxghokSfOqcqvR6K4x24N-YDYp-1U-ERYvjhtf9R_7G6hwrvO_pzoefIDFMy-acsOR2puoWlGsQsxup', 'border-zinc-500', 'text-zinc-500', 'border-white/50', 4);

-- Admin user (change password after first deploy!)
-- Password below = bcrypt hash of 'grit_admin_2024' — CHANGE THIS
-- You can generate a new hash at: https://bcrypt-generator.com
INSERT IGNORE INTO `users` (`uid`, `email`, `password_hash`, `callsign`, `is_admin`) VALUES
('admin_001', 'admin@thebookofgrit.com', '$2y$12$YpGvVF9q7K2Hy.xJKMnBHuVz0SBjF9k1V3xE1m0nR4T2p8bQaK7xS', 'OMEGA_ADMIN', 1);
