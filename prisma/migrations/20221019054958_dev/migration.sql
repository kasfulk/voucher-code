/*
  Warnings:

  - Added the required column `end_time` to the `Vouchers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_time` to the `Vouchers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Customers` MODIFY `date_of_birth` DATE NOT NULL;

-- AlterTable
ALTER TABLE `Vouchers` ADD COLUMN `end_time` DATETIME(3) NOT NULL,
    ADD COLUMN `start_time` DATETIME(3) NOT NULL;
