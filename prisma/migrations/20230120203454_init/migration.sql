-- CreateTable
CREATE TABLE "billing" (
    "id" VARCHAR(40) NOT NULL,
    "government_id" VARCHAR(11) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "due_date" TIMESTAMP(0) NOT NULL,
    "status" VARCHAR(20) NOT NULL,

    CONSTRAINT "billing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment" (
    "id" SERIAL NOT NULL,
    "paid_at" TIMESTAMP(0) NOT NULL,
    "paid_amount" DECIMAL(65,30) NOT NULL,
    "paid_by" VARCHAR(200) NOT NULL,
    "billing_id" TEXT NOT NULL,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job" (
    "id" SERIAL NOT NULL,
    "queue" VARCHAR(50) NOT NULL,
    "reference" VARCHAR(100) NOT NULL,
    "status" VARCHAR(20) NOT NULL,

    CONSTRAINT "job_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "billing_status_idx" ON "billing"("status");

-- CreateIndex
CREATE INDEX "job_queue_status_idx" ON "job"("queue", "status");

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_billing_id_fkey" FOREIGN KEY ("billing_id") REFERENCES "billing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
