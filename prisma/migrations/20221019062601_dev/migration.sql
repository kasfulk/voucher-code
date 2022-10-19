/*
  Warnings:

  - A unique constraint covering the columns `[voucher_code]` on the table `Vouchers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Vouchers_voucher_code_key` ON `Vouchers`(`voucher_code`);
