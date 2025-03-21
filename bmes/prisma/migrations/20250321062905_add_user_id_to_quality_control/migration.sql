-- AlterTable
ALTER TABLE "quality_control" ADD COLUMN     "user_id" INTEGER;

-- AddForeignKey
ALTER TABLE "quality_control" ADD CONSTRAINT "quality_control_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
