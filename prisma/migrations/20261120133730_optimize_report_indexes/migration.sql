-- DropIndex
DROP INDEX "Report_createdAt_idx";

-- DropIndex
DROP INDEX "Report_status_idx";

-- DropIndex
DROP INDEX "Report_type_idx";

-- CreateIndex
CREATE INDEX "Report_status_createdAt_idx" ON "Report"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Report_userId_createdAt_idx" ON "Report"("userId", "createdAt");
