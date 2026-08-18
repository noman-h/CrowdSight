import React from 'react'
import { Navigate } from 'react-router-dom'

function Superadminprotect({children}) {

    const token=localStorage.getItem('token')
    const role=localStorage.getItem('role')

  if(role==="superadmin" && token) return children
  else return <Navigate to='/login' />
}

export default Superadminprotect