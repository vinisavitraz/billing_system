/*
  Warnings:

  - You are about to drop the column `paid_amount` on the `billing` table. All the data in the column will be lost.
  - You are about to drop the column `paid_at` on the `billing` table. All the data in the column will be lost.
  - You are about to drop the column `paid_by` on the `billing` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `billing` DROP COLUMN `paid_amount`,
    DROP COLUMN `paid_at`,
    DROP COLUMN `paid_by`;

-- CreateTable
CREATE TABLE `payment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `paid_at` DATETIME(0) NOT NULL,
    `paid_amount` DECIMAL(65, 30) NOT NULL,
    `paid_by` VARCHAR(200) NOT NULL,
    `billing_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `payment` ADD CONSTRAINT `payment_billing_id_fkey` FOREIGN KEY (`billing_id`) REFERENCES `billing`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
