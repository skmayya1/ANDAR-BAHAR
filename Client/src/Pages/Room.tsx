/* eslint-disable @typescript-eslint/no-unused-vars */

import { useSocket } from "../Hooks/Socket";
import { useWallet } from "@solana/wallet-adapter-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Room/Navbar";
import { useEffect, useState } from "react";
import { GiPodiumWinner } from "react-icons/gi";


const Room = () => {
  const [memberCount, setmemberCount] = useState<number | undefined>(undefined)
  const [roomID, setroomID] = useState('')
  const { LeaveRoom ,Data ,GetRoomData,RoomData} = useSocket();
  const { publicKey } = useWallet();
  const router = useNavigate();
  const LeaveHabndler = () => { 
    LeaveRoom({ Name: "User", roomCode: roomID, solAddress: publicKey?.toBase58() });
    router("/");                                         
  }
  useEffect(() => { 
    setroomID(window.location.pathname.split("/")[2]);
    GetRoomData({ roomCode: window.location.pathname.split("/")[2] });
    setmemberCount(RoomData?.members?.length);
  }, [GetRoomData])
  
  const cards = [
    "2D", "2S", "2H", "2C",
    "3D", "3S", "3H", "3C",
    "4D", "4S", "4H", "4C",
    "5D", "5S", "5H", "5C",
    "6D", "6S", "6H", "6C",
    "7D", "7S", "7H", "7C",
    "8D", "8S", "8H", "8C",
    "9D", "9S", "9H", "9C",
    "JD", "JS", "JH", "JC",
    "QD", "QS", "QH", "QC",
    "KD", "KS", "KH", "KC",
    "AD", "AS", "AH", "AC"
  ];

  console.log(cards);
  
  return (
    <div className="text-black bg-zinc-800 h-screen w-full font-mono ">
      <Navbar LeaveHabndler={LeaveHabndler} MemberCount={memberCount} />
      <div className="flex justify-between pl-10 pr-36 items-center ">
        <div className="flex flex-col gap-3  items-center">
        <div className="border border-zinc-700 rounded-lg p-5 w-[30vh] flex flex-col gap-2 h-[20vh] overflow-hidden">
          <h1 className="text-zinc-200 font-semibold ">Participants:</h1>
        {
          RoomData?.members?.map((item, index) => {
            return (
              <div key={index} className="flex items-center gap-5">
                <div className="flex items-center gap-2">
                  <div className="text-zinc-200 font-semibold text-sm w-24 flex gap-1"><GiPodiumWinner color="yellow" size={18}/>{item.name}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-zinc-200 font-semibold text-sm">{item.wins}</div>
                </div>
              </div>
            )
          })}
        </div>
          <div className="border border-zinc-700 rounded-lg p-5 flex w-[30vh] flex-col gap-2 h-[20vh] text-zinc-200">
            <h1 className="font-semibold">Currrent Round:{ RoomData?.rounds}</h1>
            <div className=""></div>
          </div>
        </div>
        <div className="h-[20vw]  flex items-center w-full px-20 gap-20">
          <div className=" text-zinc-200 font-semibold font-mono text-center items-center flex justify-center flex-col gap-1 mb-8">
            <img src="/1B.svg" alt="Card SVG" width="200px" height="300px" />
          </div>          <div className=" text-zinc-200 font-semibold font-mono text-center items-center flex justify-center flex-col gap-1 h-[310px] w-[200px] border border-zinc-700 rounded-3xl">
            <h1>Bahar</h1>
          </div>
          <div className=" text-zinc-200 font-semibold font-mono text-center items-center flex justify-center flex-col gap-1 h-[310px] w-[200px] border border-zinc-700 rounded-3xl">
            <h1>Andar</h1>
          </div>
          <div className=" text-zinc-200 font-semibold font-mono text-center items-center flex justify-center flex-col gap-1 border-4 border-zinc-600 rounded-3xl mb-8">
            <img src="/3H.svg" alt="Card SVG" width="200px" height="300px" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Room