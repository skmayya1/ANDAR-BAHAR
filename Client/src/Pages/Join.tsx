import { useState } from "react"

export interface JoinProps {
  roomID: string;
  username: string;
}

const Join = () => {
  const [formData, setFormData] = useState<JoinProps>({
    roomID: "",
    username: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleJoin = () => {
    if (!formData.roomID || !formData.username) {
      alert("Please fill out both fields.");
      return;
    }
    console.log("Joining Room with Data:", formData);
    // Add logic to join a room (e.g., via WebSocket or API call)
  }

  const handleCreate = () => {
    if (!formData.username) {
      alert("Please enter a username to create a room.");
      return;
    }
    console.log("Creating a Room with Data:", formData);
    // Add logic to create a new room (e.g., call an API to create a room)
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
            onClick={handleJoin}
            className="w-full p-2 rounded-lg mb-1 hover:border-zinc-300 border-transparent transition-all ease-in-out duration-300 border-b border-l shadow shadow-zinc-400  text-white   font-mono">
            Join
          </button>
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
