ALTER TABLE `tickets`
    ADD COLUMN `user_unread_count` INTEGER NOT NULL DEFAULT 0 AFTER `status`,
    ADD COLUMN `admin_unread_count` INTEGER NOT NULL DEFAULT 0 AFTER `user_unread_count`,
    ADD COLUMN `user_last_read_at` DATETIME(3) NULL AFTER `admin_unread_count`,
    ADD COLUMN `admin_last_read_at` DATETIME(3) NULL AFTER `user_last_read_at`;
