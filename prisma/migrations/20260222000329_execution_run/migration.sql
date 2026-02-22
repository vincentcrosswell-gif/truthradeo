-- CreateTable
CREATE TABLE "ExecutionRun" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "channel" TEXT NOT NULL DEFAULT '',
    "outreachCount" INTEGER NOT NULL DEFAULT 0,
    "leadsCount" INTEGER NOT NULL DEFAULT 0,
    "callsBooked" INTEGER NOT NULL DEFAULT 0,
    "salesCount" INTEGER NOT NULL DEFAULT 0,
    "revenueCents" INTEGER NOT NULL DEFAULT 0,
    "whatWorked" TEXT NOT NULL DEFAULT '',
    "whatDidnt" TEXT NOT NULL DEFAULT '',
    "blockers" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "iterationPlanJson" JSONB NOT NULL,

    CONSTRAINT "ExecutionRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExecutionRun_userId_createdAt_idx" ON "ExecutionRun"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ExecutionRun_offerId_createdAt_idx" ON "ExecutionRun"("offerId", "createdAt");

-- AddForeignKey
ALTER TABLE "ExecutionRun" ADD CONSTRAINT "ExecutionRun_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "OfferBlueprint"("id") ON DELETE CASCADE ON UPDATE CASCADE;
