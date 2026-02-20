-- CreateTable
CREATE TABLE "CreatorSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "artistName" TEXT NOT NULL DEFAULT '',
    "cityArea" TEXT NOT NULL DEFAULT 'Chicago',
    "genre" TEXT NOT NULL DEFAULT '',
    "vibeTags" TEXT NOT NULL DEFAULT '',
    "primaryGoal" TEXT NOT NULL DEFAULT '',
    "spotify" TEXT NOT NULL DEFAULT '',
    "youtube" TEXT NOT NULL DEFAULT '',
    "instagram" TEXT NOT NULL DEFAULT '',
    "tiktok" TEXT NOT NULL DEFAULT '',
    "website" TEXT NOT NULL DEFAULT '',
    "audienceSize" TEXT NOT NULL DEFAULT '',
    "emailList" TEXT NOT NULL DEFAULT '',
    "monthlyListeners" TEXT NOT NULL DEFAULT '',
    "currentIncomeStreams" TEXT NOT NULL DEFAULT '',
    "currentOffer" TEXT NOT NULL DEFAULT '',
    "priceRange" TEXT NOT NULL DEFAULT '',
    "upcomingRelease" TEXT NOT NULL DEFAULT '',
    "performanceFrequency" TEXT NOT NULL DEFAULT '',
    "collabTargets" TEXT NOT NULL DEFAULT '',
    "biggestBlocker" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "CreatorSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CreatorSnapshot_userId_key" ON "CreatorSnapshot"("userId");
