/*
  Warnings:

  - You are about to drop the column `sourceId` on the `Event` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startAt" DATETIME NOT NULL,
    "endAt" DATETIME,
    "allDay" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Event" ("allDay", "createdAt", "endAt", "id", "notes", "source", "startAt", "title", "updatedAt") SELECT "allDay", "createdAt", "endAt", "id", "notes", "source", "startAt", "title", "updatedAt" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE INDEX "Event_userId_idx" ON "Event"("userId");
CREATE INDEX "Event_userId_startAt_idx" ON "Event"("userId", "startAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
