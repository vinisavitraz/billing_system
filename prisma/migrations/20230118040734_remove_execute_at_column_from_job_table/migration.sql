/*
  Warnings:

  - You are about to drop the column `execute_at` on the `job` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `job_status_execute_at_idx` ON `job`;

-- AlterTable
ALTER TABLE `job` DROP COLUMN `execute_at`;

-- CreateIndex
CREATE INDEX `job_queue_status_idx` ON `job`(`queue`, `status`);
