import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { Building2 } from 'lucide-react'

const CreateBusiness = () => {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { fetchUser } = useAuth()
  const { success, error: showError } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      showError('Business name is required')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/business', { name, category })
      success('Business created successfully!')
      // Refresh user data to get business
      if (fetchUser) {
        await fetchUser()
      }
      // Small delay to ensure user data is refreshed
      setTimeout(() => {
        navigate('/dashboard')
      }, 500)
    } catch (err) {
      console.error('Create business error:', err)
      let errorMessage = 'Failed to create business'

      if (err.response) {
        // Server responded with error
        if (err.response.data?.errors) {
          errorMessage = err.response.data.errors.join(', ')
        } else {
          errorMessage = err.response.data?.message || errorMessage
        }
      } else if (err.request) {
        // Request made but no response (network error)
        errorMessage = 'Network error. Please check if the backend server is running on port 5000.'
      } else {
        // Something else happened
        errorMessage = err.message || errorMessage
      }

      showError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <Building2 className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create Your Business
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Set up your business profile to get started
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Business Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="My Business"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category (Optional)
              </label>
              <input
                id="category"
                name="category"
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="e.g., Retail, Services, E-commerce"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Business'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateBusiness
