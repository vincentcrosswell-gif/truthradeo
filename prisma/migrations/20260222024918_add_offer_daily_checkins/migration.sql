-- CreateTable
CREATE TABLE "OfferDailyCheckIn" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "day" TIMESTAMP(3) NOT NULL,
    "energy" INTEGER NOT NULL DEFAULT 3,
    "minutesExecuted" INTEGER NOT NULL DEFAULT 0,
    "keyMetric" TEXT NOT NULL DEFAULT 'outreach',
    "keyMetricValue" INTEGER NOT NULL DEFAULT 0,
    "win" TEXT NOT NULL DEFAULT '',
    "blocker" TEXT NOT NULL DEFAULT '',
    "nextStep" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfferDailyCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OfferDailyCheckIn_userId_day_idx" ON "OfferDailyCheckIn"("userId", "day");

-- CreateIndex
CREATE INDEX "OfferDailyCheckIn_offerId_day_idx" ON "OfferDailyCheckIn"("offerId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "OfferDailyCheckIn_offerId_day_key" ON "OfferDailyCheckIn"("offerId", "day");

-- AddForeignKey
ALTER TABLE "OfferDailyCheckIn" ADD CONSTRAINT "OfferDailyCheckIn_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "OfferBlueprint"("id") ON DELETE CASCADE ON UPDATE CASCADE;
