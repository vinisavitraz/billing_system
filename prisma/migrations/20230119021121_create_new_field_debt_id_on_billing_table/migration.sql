/*
  Warnings:

  - The primary key for the `billing` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `billing` table. The data in that column could be lost. The data in that column will be cast from `VarChar(20)` to `Int`.
  - Added the required column `debt_id` to the `billing` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `billing` DROP PRIMARY KEY,
    ADD COLUMN `debt_id` VARCHAR(20) NOT NULL,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);
