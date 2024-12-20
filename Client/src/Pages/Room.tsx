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
  const { LeaveRoom ,Data ,GetRoomData} = useSocket();
  const { publicKey } = useWallet();
  const router = useNavigate();
  const LeaveHabndler = () => { 
    LeaveRoom({ Name: "User", roomCode: roomID, solAddress: publicKey?.toBase58() });
    router("/");                                         
  }
  useEffect(() => { 
    setroomID(window.location.pathname.split("/")[2]);
    GetRoomData({ roomCode: window.location.pathname.split("/")[2] });
  }, [GetRoomData])
  
  useEffect(() => {
    console.log(Data);
    setmemberCount(Data?.length);
  }, [Data])
  
  return (
    <div className="text-black bg-zinc-800 h-screen w-full font-mono">
      <Navbar LeaveHabndler={LeaveHabndler} MemberCount={memberCount} />
      <div className="flex justify-between pl-10 pr-36">
        <div className="border border-zinc-700 rounded-lg p-5 flex flex-col gap-2">
          <h1 className="text-zinc-200 font-semibold ">Participants</h1>
        {
          Data?.map((item, index) => {
            return (
              <div key={index} className="flex items-center gap-5 ">
                <div className="flex items-center gap-2">
                  <div className="text-zinc-200 font-semibold text-sm w-24 flex gap-1"><GiPodiumWinner color="yellow" size={18}/>{item.name}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-zinc-200 font-semibold text-sm">{item.user.solAddress.substring(0,7)}...</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-zinc-200 font-semibold text-sm">2</div>
                </div>
              </div>
            )
          })}
          </div>
      </div>
    </div>
  )
}

export default Room