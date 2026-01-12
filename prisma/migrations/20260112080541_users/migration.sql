-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'STORE_ADMIN', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED');

-- CreateEnum
CREATE TYPE "StoreStatus" AS ENUM ('INACTIVE', 'ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "AddressLabel" AS ENUM ('HOME', 'OFFICE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "roles" "UserRole"[] DEFAULT ARRAY['CUSTOMER']::"UserRole"[],
    "status" "UserStatus" NOT NULL DEFAULT 'INACTIVE',
    "activation_code" TEXT,
    "activationExpiresAt" TIMESTAMP(3),
    "fullName" TEXT,
    "phone" TEXT,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
