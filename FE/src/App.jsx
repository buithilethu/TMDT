import { useState } from 'react'
import './App.css'
import Header from './component/HomePage/Header'
import Footer from './component/HomePage/Footer'
import Slidener from './component/HomePage/Slidener'
import Center from './component/HomePage/Center'
import Dvu from './component/HomePage/Dvu'



function App() {


  return (
    <>
     <div className="Container">
      <div className="Center">
        <Header/>
        <Slidener/>
        <Center/>
        <Dvu/>
        <Footer/>
      </div>
     </div>
    </>
  )
}

export default App
