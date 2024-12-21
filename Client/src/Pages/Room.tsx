/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { GiPodiumWinner } from "react-icons/gi";
import { useNavigate, useParams } from "react-router-dom";
import { useSocket } from "../Hooks/Socket";
import { useWallet } from "@solana/wallet-adapter-react";
import Navbar from "../Components/Room/Navbar";

const Room = () => {
  const [memberCount, setMemberCount] = useState<number | undefined>(undefined);
  const { id } = useParams();
  const { LeaveRoom, GetRoomData, RoomData, CardData  ,Ready ,setReady} = useSocket();
  const { publicKey } = useWallet();
  const router = useNavigate();
  const [betAmount, setBetAmount] = useState<number | undefined>(undefined);
  setReady(true);
  useEffect(() => {
    if (GetRoomData && id) {
      GetRoomData({ roomCode: id });
    }
  }, [id,Ready]);

  const fetchData = async () => {
    if (GetRoomData && id) {
      GetRoomData({ roomCode: id });
    }
  };

  useEffect(() => {
    if (RoomData?.members ?.length !== memberCount) {
      setMemberCount(RoomData?.members?.length);
      fetchData();
    }
  }, [RoomData?.members?.length, memberCount]);
  

  const LeaveHandler = () => {
    if (id && publicKey) {
      LeaveRoom({ Name: "User", roomCode: id, solAddress: publicKey.toBase58() });
      router("/");
    }
  };

  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = Number(e.target.value);

    if (inputValue >= 1 && inputValue <= 999) {
      setBetAmount(inputValue);
    } else if (e.target.value === "") {
      setBetAmount(undefined);
    }
  };

  const placeBet = () => {
    if (betAmount && betAmount >= 1 && betAmount <= 999) {
      console.log("Bet placed: ", betAmount);
    }
  };

  return (
    <div className="text-black bg-zinc-800 h-screen w-full font-mono">
      <Navbar LeaveHabndler={LeaveHandler} MemberCount={memberCount} />
      <div className="flex justify-between pl-10 pr-36 items-center">
        <div className="flex flex-col gap-3 items-center">
          <div className="border border-zinc-700 rounded-lg p-5 w-[30vh] flex flex-col gap-2 h-[20vh] overflow-hidden">
            <h1 className="text-zinc-200 font-semibold">Participants:</h1>
            {RoomData?.members?.map((item, index) => (
              <div key={index} className="flex items-center gap-5">
                <div className="flex items-center gap-2">
                  <div className="text-zinc-200 font-semibold text-sm w-24 flex gap-1">
                    <GiPodiumWinner color="yellow" size={18} />
                    {item.name}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-zinc-200 font-semibold text-sm">{item.wins}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="border border-zinc-700 rounded-lg p-5 flex w-[30vh] flex-col gap-2 h-[20vh] text-zinc-200">
            <h1 className="font-semibold">Current Round: {RoomData?.rounds}</h1>
          </div>
          <div className="border border-zinc-700 rounded-lg p-5 flex w-[30vh] flex-col gap-2 h-[20vh] text-zinc-200">
            <h1 className="font-semibold">Place Bet:</h1>
            <input
              className="border border-zinc-700 rounded-lg p-2 w-full bg-transparent text-zinc-200 outline-none"
              type="number"
              placeholder="1-999"
              value={betAmount || ""}
              min="1"
              max="999"
              onChange={handleBetChange}
            />
            <button
              className="bg-green-400 p-2 text-zinc-800 font-semibold rounded-lg"
              onClick={placeBet}
            >
              Bet
            </button>
          </div>
        </div>
        <div className="h-[20vw] flex items-center w-full px-20 gap-20">
          <div className="text-zinc-200 font-semibold font-mono text-center items-center flex justify-center flex-col gap-1 mb-8">
            <img src="/1B.svg" alt="Card SVG" width="200px" height="300px" />
          </div>
          <div className="text-zinc-200 font-semibold font-mono text-center items-center flex justify-center flex-col gap-1 h-[310px] w-[200px] border border-zinc-700 rounded-3xl">
            <h1>Bahar</h1>
          </div>
          <div className="text-zinc-200 font-semibold font-mono text-center items-center flex justify-center flex-col gap-1 h-[310px] w-[200px] border border-zinc-700 rounded-3xl">
            <h1>Andar</h1>
          </div>
          <div className="text-zinc-200 font-semibold font-mono text-center items-center flex justify-center flex-col gap-1 border-4 border-zinc-600 rounded-3xl mb-8 h-[310px] w-[200px]">
            {CardData?.CurrCard ? (
              <img src={"/" + CardData.CurrCard + ".svg"} alt="Card SVG" width="200px" height="300px" />
            ) : (
              <h1>Waiting for Cards</h1>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;
