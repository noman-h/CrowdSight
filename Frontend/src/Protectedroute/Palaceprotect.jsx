import React from 'react'

function Palaceprotect({children}) {
  
    const token=localStorage.getItem('token')
    const role=localStorage.getItem('role')

  if(role==="palace" && token) return  children
  else if(role==="superadmin" && token) return <Navigate to='/superadmin' />
  else if(role==="admin" && token)return  <Navigate to='/admin' />
  else return  <Navigate to='/login' />
}


export default Palaceprotect