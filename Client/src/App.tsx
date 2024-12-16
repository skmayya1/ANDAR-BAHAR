import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './Pages/Home'
import Join from './Pages/Join'
import Room from './Pages/Room'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home/>
  },
  {
    path: '/room',
    element: <Join/>
  },
  {
    path: '/room/:id',
    element: <Room/>
  }
])

const App = () => {

  return (
    <RouterProvider router={router}/>
    )
}

export default App