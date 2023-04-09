-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT
);

-- CreateTable
CREATE TABLE "Purpose" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "DocumentType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL,
    "barCode" TEXT,
    "sigaCode" TEXT,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "price" REAL NOT NULL DEFAULT 0,
    "totalCost" REAL NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Stock" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "originalCount" INTEGER NOT NULL DEFAULT 0,
    "currentCount" INTEGER NOT NULL DEFAULT 0,
    "lote" TEXT NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "price" REAL NOT NULL,
    "productId" TEXT,
    CONSTRAINT "Stock_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Kardex" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fromStoreId" TEXT NOT NULL,
    "fromVirtualStoreId" TEXT NOT NULL,
    "toStoreId" TEXT NOT NULL,
    "toVirtualStoreId" TEXT NOT NULL,
    "purposeId" TEXT NOT NULL,
    "documentTypeId" TEXT NOT NULL,
    "documentNumber" TEXT NOT NULL,
    "documentDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receptionDate" DATETIME,
    "reference" TEXT,
    "isSale" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Kardex_fromStoreId_fkey" FOREIGN KEY ("fromStoreId") REFERENCES "Store" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Kardex_fromVirtualStoreId_fkey" FOREIGN KEY ("fromVirtualStoreId") REFERENCES "Store" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Kardex_toStoreId_fkey" FOREIGN KEY ("toStoreId") REFERENCES "Store" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Kardex_toVirtualStoreId_fkey" FOREIGN KEY ("toVirtualStoreId") REFERENCES "Store" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Kardex_purposeId_fkey" FOREIGN KEY ("purposeId") REFERENCES "Purpose" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Kardex_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES "DocumentType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KardexDetail" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kardexId" INTEGER NOT NULL,
    "productId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "lote" TEXT,
    "dueDate" DATETIME,
    "price" REAL NOT NULL,
    CONSTRAINT "KardexDetail_kardexId_fkey" FOREIGN KEY ("kardexId") REFERENCES "Kardex" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "KardexDetail_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
