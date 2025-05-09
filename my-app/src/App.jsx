import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Base from './fabric.jsx'
import {Routes,Route,Link} from 'react-router-dom'
import { BrowserRouter } from "react-router-dom";
import Signup from './components/signup.jsx'
import Login from './components/login.jsx'
import Home from './components/Home.jsx'
import Square from './square.jsx'
import TextCanvas from './ts.jsx'
import HomePage from './home'
import FlowWithCanvasNodes from './word.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <BrowserRouter>
     <Routes>
      <Route path='/signup' element={<Signup/>}></Route>
      <Route path='/sign' element={<FlowWithCanvasNodes/>}></Route>
      <Route path='/login' element={<Login/>}></Route>
      <Route path='/log' element={<HomePage/>}></Route>
     <Route path='/' element={<Home/>}></Route>
     <Route path='/square' element={<Square/>}></Route>
     <Route path='/text' element={<TextCanvas/>}></Route>
     <Route path='/Base' element={<Base/>}></Route>
    </Routes>

    </BrowserRouter>
    </>
 
  )
}

export default App
