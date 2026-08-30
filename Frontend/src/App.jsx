import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
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
import Userprotect from './Protectedroute/Userprotect'
import UserCheckins from './UserPages/UserCheckins'
import Footer from './Components/Footer'
import AboutUs from './Pages/AboutUs'
import ContactUs from './Pages/ContactUs'
import NotFound from './Pages/NotFound'

function HomeRoute() {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  if (token && role === 'superadmin') return <Navigate to="/superadmin" replace />
  if (token && role === 'admin') return <Navigate to="/admin" replace />
  if (token && role === 'palace') return <Navigate to="/palace" replace />

  return <UserHome />
}

function App() {

  return (
   <BrowserRouter>
   <div className="flex min-h-dvh flex-col">
   <Header />
   <div className="flex-1">
   <Routes>
    <Route path='/' element={<HomeRoute />}/>

    <Route path='/palaces/:id' element={<UserViewPalace/>}/>

    <Route path='/my-checkins' element={<Userprotect><UserCheckins/></Userprotect>} />

    <Route path='/login' element={<Login/>} />


    <Route path='/signup' element={<Signup/>} />
    <Route path='/helpandsupport' element={<HelpAndSupport/>} />
    <Route path='/aboutus' element={<AboutUs/>} />
    <Route path='/contactus' element={<ContactUs/>} />
    <Route path='/adminaddform/:id?' element={<AdminRegisterForm/>} />
    <Route path='/palaceaddform/:id?' element={<PalaceRegisterForm/>} />
    <Route path='/forgotpassword' element={<Forgotpass/>} />
    <Route path='/resetpassword' element={<Authroute><Resetpass/></Authroute>}/>
    <Route path='/superadmin' element={<Superadminprotect><Superadminhome/></Superadminprotect>} />
    <Route path='/admin' element={<Adminprotect><Adminhome/></Adminprotect>} />
    <Route path='/palace' element={<Palaceprotect> <Palacehome/></Palaceprotect>} />
    <Route path='*' element={<NotFound />} />
   </Routes>
   </div>
   <Footer />
   </div>
   </BrowserRouter>
  )
}

export default App
