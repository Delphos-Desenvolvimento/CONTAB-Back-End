/*
  Warnings:

  - Added the required column `base64` to the `Img` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `img` ADD COLUMN `base64` LONGTEXT NOT NULL,
    MODIFY `url` VARCHAR(191) NULL;
