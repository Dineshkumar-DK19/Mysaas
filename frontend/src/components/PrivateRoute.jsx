import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Layout from './Layout'

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // Check if user has a business, if not redirect to create business
  // Skip this check for create-business route
  if (!user?.business && location.pathname !== '/create-business') {
    return <Navigate to="/create-business" replace />
  }

  // If user has business but is on create-business page, redirect to dashboard
  if (user?.business && location.pathname === '/create-business') {
    return <Navigate to="/dashboard" replace />
  }

  return <Layout>{children}</Layout>
}

export default PrivateRoute
