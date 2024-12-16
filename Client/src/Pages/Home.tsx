import { useNavigate } from 'react-router-dom'

const Home = () => {
  const router = useNavigate()
  const ClickHandler = () => {
     router('/room')
     }
  return (
    <div className='bg-zinc-800 h-screen w-full flex items-center justify-center'>
      <button 
        onClick={ClickHandler}
        className='font-semibold px-10 rounded-lg hover:bg-red-400 transition-all ease-in-out duration-300 py-3 bg-red-500 active:scale-105 '>Get Started</button>
    </div>
  )
}

export default Home