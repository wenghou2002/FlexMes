-- AlterTable
ALTER TABLE "production" ADD COLUMN     "user_id" INTEGER;

-- AddForeignKey
ALTER TABLE "production" ADD CONSTRAINT "production_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
