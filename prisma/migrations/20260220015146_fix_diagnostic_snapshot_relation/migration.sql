-- CreateTable
CREATE TABLE "DiagnosticReport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "snapshotId" TEXT,
    "monetizationScore" INTEGER NOT NULL,
    "audienceScore" INTEGER NOT NULL,
    "offerScore" INTEGER NOT NULL,
    "momentumScore" INTEGER NOT NULL,
    "clarityScore" INTEGER NOT NULL,
    "topMovesJson" JSONB NOT NULL,
    "notesJson" JSONB NOT NULL,

    CONSTRAINT "DiagnosticReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfferBlueprint" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lane" TEXT NOT NULL,
    "goal" TEXT NOT NULL DEFAULT '',
    "audience" TEXT NOT NULL DEFAULT '',
    "vibe" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL DEFAULT '',
    "promise" TEXT NOT NULL DEFAULT '',
    "pricing" JSONB NOT NULL,
    "deliverables" JSONB NOT NULL,
    "funnel" JSONB NOT NULL,
    "scripts" JSONB NOT NULL,

    CONSTRAINT "OfferBlueprint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DiagnosticReport_userId_createdAt_idx" ON "DiagnosticReport"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "OfferBlueprint_userId_createdAt_idx" ON "OfferBlueprint"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "DiagnosticReport" ADD CONSTRAINT "DiagnosticReport_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "CreatorSnapshot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
