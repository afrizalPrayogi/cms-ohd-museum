-- CreateTable
CREATE TABLE `editorialtopicmonth` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` VARCHAR(191) NULL,
    `year` INTEGER NOT NULL,
    `month` INTEGER NOT NULL,
    `keyTopic` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `createBy` VARCHAR(191) NULL,
    `updateBy` VARCHAR(191) NULL,

    INDEX `editorialtopicmonth_year_month_idx`(`year`, `month`),
    UNIQUE INDEX `editorialtopicmonth_companyId_year_month_key`(`companyId`, `year`, `month`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `editorialplan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyId` VARCHAR(191) NULL,
    `topicMonthId` INTEGER NOT NULL,
    `planDate` DATETIME(3) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `person` VARCHAR(191) NULL,
    `status` ENUM('NOT_STARTED', 'ON_PROGRESS', 'UPLOADING', 'PUBLISHED') NOT NULL DEFAULT 'NOT_STARTED',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `createBy` VARCHAR(191) NULL,
    `updateBy` VARCHAR(191) NULL,

    INDEX `editorialplan_status_idx`(`status`),
    INDEX `editorialplan_planDate_idx`(`planDate`),
    UNIQUE INDEX `editorialplan_topicMonthId_planDate_key`(`topicMonthId`, `planDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `editorialplanattachment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `editorialPlanId` INTEGER NOT NULL,
    `type` ENUM('IMAGE', 'ATTACHMENT') NOT NULL DEFAULT 'ATTACHMENT',
    `url` VARCHAR(500) NOT NULL,
    `fileName` VARCHAR(191) NULL,
    `mimeType` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `createBy` VARCHAR(191) NULL,
    `updateBy` VARCHAR(191) NULL,

    INDEX `editorialplanattachment_editorialPlanId_idx`(`editorialPlanId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `editorialplanassignment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `editorialPlanId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `createBy` VARCHAR(191) NULL,
    `updateBy` VARCHAR(191) NULL,

    INDEX `editorialplanassignment_userId_idx`(`userId`),
    UNIQUE INDEX `editorialplanassignment_editorialPlanId_userId_key`(`editorialPlanId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `editorialplancomment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `editorialPlanId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `comment` TEXT NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `createBy` VARCHAR(191) NULL,
    `updateBy` VARCHAR(191) NULL,

    INDEX `editorialplancomment_editorialPlanId_idx`(`editorialPlanId`),
    INDEX `editorialplancomment_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `editorialtopicmonth` ADD CONSTRAINT `editorialtopicmonth_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `editorialplan` ADD CONSTRAINT `editorialplan_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `editorialplan` ADD CONSTRAINT `editorialplan_topicMonthId_fkey` FOREIGN KEY (`topicMonthId`) REFERENCES `editorialtopicmonth`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `editorialplanattachment` ADD CONSTRAINT `editorialplanattachment_editorialPlanId_fkey` FOREIGN KEY (`editorialPlanId`) REFERENCES `editorialplan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `editorialplanassignment` ADD CONSTRAINT `editorialplanassignment_editorialPlanId_fkey` FOREIGN KEY (`editorialPlanId`) REFERENCES `editorialplan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `editorialplanassignment` ADD CONSTRAINT `editorialplanassignment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `editorialplancomment` ADD CONSTRAINT `editorialplancomment_editorialPlanId_fkey` FOREIGN KEY (`editorialPlanId`) REFERENCES `editorialplan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `editorialplancomment` ADD CONSTRAINT `editorialplancomment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
