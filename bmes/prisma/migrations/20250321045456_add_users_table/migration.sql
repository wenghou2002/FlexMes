-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" VARCHAR(20) NOT NULL DEFAULT 'user',
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production" (
    "product_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "material" VARCHAR(255),
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "production_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "quality_control" (
    "inspection_id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "inspection_date" DATE NOT NULL,
    "scheduled_date" DATE NOT NULL,
    "result" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quality_control_pkey" PRIMARY KEY ("inspection_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "quality_control" ADD CONSTRAINT "quality_control_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "production"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;
