/* eslint-disable @typescript-eslint/no-unused-vars */
import { createContext, useState } from "react"

interface gameContext{
  data: Data | null; //GameDetails
}
interface Data {
  roomCode: string;
  players: Player[];
  rounds: number;
}
interface Player { 
  name: string;
  score: number;
  socketId: string;
}
interface GameProviderProps { 
  children: React.ReactNode;
}
const GameContexts = createContext<gameContext | undefined>(undefined)

const GameContext = ({ children }: GameProviderProps) => {
  const [data, setData] = useState<Data | null>(null)
  return (
    <GameContexts.Provider value={{ data }}>
      {children}
    </GameContexts.Provider>
    )
}

export default GameContext