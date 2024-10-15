-- CreateTable
CREATE TABLE "Users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "firstName" VARCHAR(100),
    "lastName" VARCHAR(100),
    "email" VARCHAR(150) NOT NULL,
    "password" VARCHAR(255),
    "phone" VARCHAR(20),
    "dateOfBirth" TIMESTAMPTZ(6),
    "address" VARCHAR(255),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "role" VARCHAR(20) NOT NULL,
    "refreshToken" VARCHAR(255),
    "createdDate" TIMESTAMPTZ(6),
    "updatedDate" TIMESTAMPTZ(6),

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");
