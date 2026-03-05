-- DropForeignKey
ALTER TABLE "ServiceProfile" DROP CONSTRAINT "ServiceProfile_categoryId_fkey";

-- AlterTable
ALTER TABLE "ServiceProfile" ADD COLUMN     "serviceType" TEXT NOT NULL DEFAULT 'General Service',
ALTER COLUMN "categoryId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ServiceProfile" ADD CONSTRAINT "ServiceProfile_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ServiceCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
