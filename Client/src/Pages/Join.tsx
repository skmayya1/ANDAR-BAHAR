import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react"
import { Bounce, toast } from "react-toastify";
import { useSocket } from "../Hooks/Socket";
import { useNavigate } from "react-router-dom";

export interface JoinProps {
  roomID: string;
  username: string;
}

const Join = () => {
  const {connected,publicKey} = useWallet();
  const [formData, setFormData] = useState<JoinProps>({
    roomID: "",
    username: ""
  })
  const { CreateRoom } = useSocket();
  const router = useNavigate();
 
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }
  const handleCreate = () => {
    if (!connected) {
      return toast.error("Connect your wallet", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
    }
    if (!formData.username) {
      alert("Please enter a username to create a room.");
      return;
    }
    console.log("Creating a Room with Data:", formData);
    CreateRoom({ Name: formData.username, roomCode: formData.roomID, solAddress: publicKey?.toBase58() });
    router(`/room/${formData.roomID}`);
  }

  return (
    <div className="h-screen w-full bg-zinc-900 flex items-center justify-center">
      <div className="bg-zinc-800 rounded-lg shadow-lg w-[20%] p-10">
        <h1 className="text-2xl font-bold text-center text-zinc-400 font-mono">Join / Create a Room</h1>

        <div className="mt-4">
          <input
            type="text"
            name="roomID"
            value={formData.roomID}
            onChange={handleChange}
            maxLength={4}
            placeholder="Room ID"
            className="w-full p-2 rounded-lg bg-zinc-700 text-white outline-none font-mono"
          />
        </div>

        <div className="mt-4">
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            className="w-full p-2 rounded-lg bg-zinc-700 text-white outline-none font-mono"
          />
        </div>

        <div className="mt-4">
          <button
            onClick={handleCreate}
            className="w-full p-2 rounded-lg mt-1 text-white hover:border-zinc-300 border-transparent transition-all ease-in-out duration-300 border-b border-l shadow shadow-zinc-400  font-mono">
            Create
          </button>
        </div>
      </div>
    </div>
  )
}

export default Join;
