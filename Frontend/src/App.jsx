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
import Adminprotect from './Protectedroute/Adminprotect'
import Adminhome from './AdminPages/Adminhome'
import PalaceRegisterForm from './Forms/PalaceRegisterForm'
import UserHome from './UserPages/UserHome'
import UserViewPalace from './UserPages/UserViewpalace'
import Palacehome from './PalacePages/Palacehome'
import Palaceprotect from './Protectedroute/Palaceprotect'

function App() {

  return (
   <BrowserRouter>
   <Header /> 
   <Routes>
    <Route path='/' element={<UserHome/>}/>
    <Route path='/palaces/:id' element={<UserViewPalace/>}/>
    <Route path='/login' element={<Login/>} />
    <Route path='/signup' element={<Signup/>} />
    <Route path='/helpandsupport' element={<HelpAndSupport/>} />
    <Route path='/adminaddform/:id?' element={<AdminRegisterForm/>} />
    <Route path='/palaceaddform/:id?' element={<PalaceRegisterForm/>} />
    <Route path='/forgotpassword' element={<Forgotpass/>} />
    <Route path='/' element={<UserHome/>} />
    <Route path='/resetpassword' element={<Authroute><Resetpass/></Authroute>}/>
    <Route path='/superadmin' element={<Superadminprotect><Superadminhome/></Superadminprotect>} />
    <Route path='/admin' element={<Adminprotect><Adminhome/></Adminprotect>} />
    <Route path='/palace' element={<Palaceprotect> <Palacehome/></Palaceprotect>} />
   </Routes>
   </BrowserRouter>
  )
}

export default App
