-- CreateTable
CREATE TABLE "Products" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(15,2) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "supplierId" VARCHAR(36) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Products_pkey" PRIMARY KEY ("id")
);
