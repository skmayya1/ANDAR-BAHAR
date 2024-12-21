/*
  Warnings:

  - You are about to drop the column `SelectedCard` on the `RoomMember` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "RoomMember_roomId_idx";

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "RoundStarted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "currentMagicCard" TEXT,
ADD COLUMN     "currentRound" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pool" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "RoomMember" DROP COLUMN "SelectedCard",
ADD COLUMN     "betQty" INTEGER,
ADD COLUMN     "bettedOn" INTEGER;

-- CreateIndex
CREATE INDEX "RoomMember_roomId_userId_idx" ON "RoomMember"("roomId", "userId");
