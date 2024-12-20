import { RxExit } from "react-icons/rx";
import { FaUser } from "react-icons/fa";
interface INavbar { 
  LeaveHabndler: () => void
  MemberCount:number | undefined
}
const Navbar = ({ LeaveHabndler,MemberCount }:INavbar) => {
  return (
    <div className="pt-20 flex w-full justify-end px-36 items-center gap-5">
      <div className="flex items-center justify-center gap-2 text-green-500 font-semibold text-sm"><FaUser size={18} color="white" /> {MemberCount}</div>
      <button onClick={LeaveHabndler}
        className="flex text-zinc-800 items-center justify-center  gap-2 font-semibold text-md bg-zinc-100 px-2.5 rounded-lg  py-1 "><RxExit /> Exit</button>
    </div>  )
}

export default Navbar