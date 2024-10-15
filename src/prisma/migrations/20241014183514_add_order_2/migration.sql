-- AlterTable
ALTER TABLE "OrderItem" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "Orders" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
