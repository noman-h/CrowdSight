import { useState } from 'react'
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Header from './Pages/Header'
import Login from './AuthPages/Login'
import Signup from './AuthPages/Signup'
import Forgotpass from './AuthPages/Forgotpass'
import Resetpass from './AuthPages/Resetpass'
import Authroute from './Protectedroute/Authroute'
import Superadminprotect from './Protectedroute/Superadminprotect'
import Superadminhome from './SuperAdminpages/Superadminhome'
import HelpAndSupport from './Pages/HelpAndSupport'
import AdminRegisterForm from './Forms/AdminRegisterForm'

function App() {

  return (
   <BrowserRouter>
   <Header /> 
   <Routes>
    <Route path='/login' element={<Login/>} />
    <Route path='/signup' element={<Signup/>} />
    <Route path='/helpandsupport' element={<HelpAndSupport/>} />
    <Route path='/adminaddform/:id?' element={<AdminRegisterForm/>} />
    <Route path='/forgotpassword' element={<Forgotpass/>} />
    <Route path='/resetpassword' element={<Authroute><Resetpass/></Authroute>}/>
    <Route path='/superadmin' element={<Superadminprotect><Superadminhome/></Superadminprotect>} />
   </Routes>
   </BrowserRouter>
  )
}

export default App
