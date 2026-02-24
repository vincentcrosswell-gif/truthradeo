-- CreateTable
CREATE TABLE "AppEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "route" TEXT NOT NULL DEFAULT '',
    "step" TEXT NOT NULL DEFAULT '',
    "offerId" TEXT,
    "snapshotId" TEXT,
    "meta" JSONB,

    CONSTRAINT "AppEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AppEvent_userId_createdAt_idx" ON "AppEvent"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AppEvent_userId_name_createdAt_idx" ON "AppEvent"("userId", "name", "createdAt");

-- CreateIndex
CREATE INDEX "AppEvent_userId_step_createdAt_idx" ON "AppEvent"("userId", "step", "createdAt");
