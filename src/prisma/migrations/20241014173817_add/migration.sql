-- CreateTable
CREATE TABLE "Orders" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "totalAmount" DECIMAL(15,2) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(15,2) NOT NULL,
    "isRental" BOOLEAN NOT NULL DEFAULT false,
    "rentalDuration" INTEGER,
    "rentalReturnDate" TIMESTAMPTZ(6),

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);
