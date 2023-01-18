-- CreateTable
CREATE TABLE `billing` (
    `id` VARCHAR(20) NOT NULL,
    `government_id` VARCHAR(11) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `due_date` DATETIME(0) NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    `paid_at` DATETIME(0) NULL,
    `paid_amount` DECIMAL(65, 30) NULL,
    `paid_by` VARCHAR(200) NULL,

    INDEX `billing_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `job` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `queue` VARCHAR(50) NOT NULL,
    `execute_at` DATETIME(0) NOT NULL,
    `reference` VARCHAR(20) NOT NULL,
    `status` VARCHAR(20) NOT NULL,

    INDEX `job_status_execute_at_idx`(`status`, `execute_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
