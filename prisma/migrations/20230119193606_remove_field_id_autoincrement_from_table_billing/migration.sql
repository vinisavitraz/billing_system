/*
  Warnings:

  - The primary key for the `billing` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `debt_id` on the `billing` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `payment` DROP FOREIGN KEY `payment_billing_id_fkey`;

-- AlterTable
ALTER TABLE `billing` DROP PRIMARY KEY,
    DROP COLUMN `debt_id`,
    MODIFY `id` VARCHAR(40) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `payment` MODIFY `billing_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `payment` ADD CONSTRAINT `payment_billing_id_fkey` FOREIGN KEY (`billing_id`) REFERENCES `billing`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
