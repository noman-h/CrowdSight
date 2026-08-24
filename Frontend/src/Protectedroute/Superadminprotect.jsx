import React from 'react'
import { Navigate } from 'react-router-dom'

function Superadminprotect({children}) {

    const token=localStorage.getItem('token')
    const role=localStorage.getItem('role')

  if(role==="superadmin" && token) return children
  else if(role==="admin" && token)return  <Navigate to='/admin' />
  else if(role==="palace" && token)return  <Navigate to='/palace' />
  else return  <Navigate to='/login' />
}

export default Superadminprotect