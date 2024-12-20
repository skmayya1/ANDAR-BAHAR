-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "rounds" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "RoomMember" ADD COLUMN     "SelectedCard" TEXT,
ADD COLUMN     "wins" INTEGER NOT NULL DEFAULT 0;
