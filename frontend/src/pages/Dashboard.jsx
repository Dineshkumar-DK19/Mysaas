import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useToast } from '../contexts/ToastContext'
import { MessageSquare, TrendingUp, Users, Send, Send as SendIcon } from 'lucide-react'

const Dashboard = () => {
  const [business, setBusiness] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [usage, setUsage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [testLoading, setTestLoading] = useState(false)
  const [testForm, setTestForm] = useState({ from: '', text: '' })
  const { success, error: showError } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [businessRes, analyticsRes, usageRes] = await Promise.all([
        api.get('/business'),
        api.get('/business/analytics'),
        api.get('/business/usage'),
      ])
      setBusiness(businessRes.data)
      setAnalytics(analyticsRes.data)
      setUsage(usageRes.data)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      if (error.response?.status !== 404) {
        showError('Failed to load dashboard data')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleTestInbound = async (e) => {
    e.preventDefault()
    if (!testForm.from || !testForm.text) {
      showError('Please fill in both phone number and message')
      return
    }

    setTestLoading(true)
    try {
      await api.post('/whatsapp/test-inbound', testForm)
      success('Test message sent successfully!')
      setTestForm({ from: '', text: '' })
      setTimeout(fetchData, 1000) // Refresh data after a second
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to send test message')
    } finally {
      setTestLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const stats = [
    {
      name: 'Total Conversations',
      value: analytics?.conversations || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Total Messages',
      value: analytics?.messages || 0,
      icon: MessageSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      name: 'Inbound Messages',
      value: analytics?.inbound || 0,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      name: 'Outbound Messages',
      value: analytics?.outbound || 0,
      icon: Send,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, {business?.name || 'Business'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${stat.bgColor} rounded-md p-3`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {stat.value.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Usage & Plan Info */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 mb-8">
        {/* Usage Card */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Usage This Month</h2>
          {usage && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Messages</span>
                  <span className="font-medium">
                    {usage.usage.messagesThisMonth} / {usage.limits.messages}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{
                      width: `${
                        (usage.usage.messagesThisMonth / usage.limits.messages) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">AI Replies</span>
                  <span className="font-medium">
                    {usage.usage.aiRepliesThisMonth} / {usage.limits.aiReplies}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${
                        (usage.usage.aiRepliesThisMonth / usage.limits.aiReplies) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="pt-2">
                <span className="text-sm text-gray-500">
                  Plan: <span className="font-semibold capitalize">{usage.plan}</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/conversations"
              className="block w-full text-left px-4 py-2 bg-primary-50 text-primary-700 rounded-md hover:bg-primary-100 transition"
            >
              View Conversations
            </Link>
            <Link
              to="/rules"
              className="block w-full text-left px-4 py-2 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition"
            >
              Manage Rules
            </Link>
            <Link
              to="/settings"
              className="block w-full text-left px-4 py-2 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition"
            >
              Settings
            </Link>
            <Link
              to="/plan"
              className="block w-full text-left px-4 py-2 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition"
            >
              Upgrade Plan
            </Link>
          </div>
        </div>
      </div>

      {/* Test Inbound Message */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Inbound Message</h2>
        <p className="text-sm text-gray-600 mb-4">
          Simulate an incoming message to test your auto-reply system
        </p>
        <form onSubmit={handleTestInbound} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={testForm.from}
              onChange={(e) => setTestForm({ ...testForm, from: e.target.value })}
              placeholder="1234567890"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              value={testForm.text}
              onChange={(e) => setTestForm({ ...testForm, text: e.target.value })}
              placeholder="Type your test message..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={testLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            <SendIcon className="h-4 w-4 mr-2" />
            {testLoading ? 'Sending...' : 'Send Test Message'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Dashboard
