import { Navigate } from 'react-router-dom'

function Userprotect({ children }) {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  if (token && role === 'user') return children
  if (token && role === 'superadmin') return <Navigate to="/superadmin" replace />
  if (token && role === 'admin') return <Navigate to="/admin" replace />
  if (token && role === 'palace') return <Navigate to="/palace" replace />
  return <Navigate to="/login" replace />
}

export default Userprotect
