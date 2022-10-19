-- CreateTable
CREATE TABLE `Customers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `first_name` VARCHAR(191) NOT NULL,
    `last_name` VARCHAR(191) NOT NULL,
    `gender` VARCHAR(191) NOT NULL,
    `date_of_birth` DATETIME(3) NOT NULL,
    `contact_number` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PurchaseTransaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `customer_id` INTEGER NOT NULL,
    `total_spent` DECIMAL(65, 2) NOT NULL,
    `total_saving` DECIMAL(65, 2) NOT NULL,
    `transaction_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VoucherTransactions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `customer_id` INTEGER NOT NULL,
    `purchase_id` INTEGER NOT NULL,
    `redeemed_at` DATETIME(3) NOT NULL,
    `voucher_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Vouchers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `voucher_code` VARCHAR(191) NOT NULL,
    `value` DECIMAL(65, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PurchaseTransaction` ADD CONSTRAINT `PurchaseTransaction_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `Customers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VoucherTransactions` ADD CONSTRAINT `VoucherTransactions_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `Customers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VoucherTransactions` ADD CONSTRAINT `VoucherTransactions_purchase_id_fkey` FOREIGN KEY (`purchase_id`) REFERENCES `PurchaseTransaction`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VoucherTransactions` ADD CONSTRAINT `VoucherTransactions_voucher_id_fkey` FOREIGN KEY (`voucher_id`) REFERENCES `Vouchers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
