import React from 'react'
import { Navigate } from 'react-router-dom'

function Adminprotect({children}) {

    const token=localStorage.getItem('token')
    const role=localStorage.getItem('role')

  if(role==="admin" && token) return children
  else if(role==="superadmin" && token) return <Navigate to='/superadmin' />
  else return <Navigate to='/login' />
}

export default Adminprotect