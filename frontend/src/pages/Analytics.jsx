import { useEffect, useState } from 'react'
import api from '../services/api'
import { TrendingUp, MessageSquare, Send, Users } from 'lucide-react'

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null)
  const [usage, setUsage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [analyticsRes, usageRes] = await Promise.all([
        api.get('/business/analytics'),
        api.get('/business/usage'),
      ])
      setAnalytics(analyticsRes.data)
      setUsage(usageRes.data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-2 text-gray-600">View your business performance metrics</p>
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

      {/* Usage Details */}
      {usage && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Monthly Usage
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Messages</span>
                  <span className="font-medium">
                    {usage.usage.messagesThisMonth} / {usage.limits.messages}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-primary-600 h-3 rounded-full transition-all"
                    style={{
                      width: `${
                        Math.min(
                          (usage.usage.messagesThisMonth / usage.limits.messages) * 100,
                          100
                        )
                      }%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {usage.remaining.messages} remaining
                </p>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">AI Replies</span>
                  <span className="font-medium">
                    {usage.usage.aiRepliesThisMonth} / {usage.limits.aiReplies}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all"
                    style={{
                      width: `${
                        Math.min(
                          (usage.usage.aiRepliesThisMonth / usage.limits.aiReplies) *
                            100,
                          100
                        )
                      }%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {usage.remaining.aiReplies} remaining
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Plan Information
            </h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Current Plan</span>
                <p className="text-lg font-semibold capitalize">{usage.plan}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">AI Replies Used</span>
                <p className="text-lg font-semibold">
                  {usage.analytics?.aiReplies || 0}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Rule Replies</span>
                <p className="text-lg font-semibold">
                  {usage.analytics?.ruleReplies || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Analytics
