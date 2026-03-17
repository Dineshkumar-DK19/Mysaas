import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useToast } from '../contexts/ToastContext'
import { Check, CreditCard } from 'lucide-react'

const Plan = () => {
  const [planDetails, setPlanDetails] = useState(null)
  const [currentPlan, setCurrentPlan] = useState('free')
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const navigate = useNavigate()
  const { success, error: showError } = useToast()

  useEffect(() => {
    fetchPlan()
  }, [])

  const fetchPlan = async () => {
    try {
      const [planRes, businessRes] = await Promise.all([
        api.get('/business/plan'),
        api.get('/business'),
      ])
      setPlanDetails(planRes.data)
      setCurrentPlan(businessRes.data.plan || 'free')
    } catch (error) {
      console.error('Failed to fetch plan:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (newPlan) => {
    if (newPlan === currentPlan) return

    setUpgrading(true)
    try {
      await api.post('/business/plan/upgrade', { plan: newPlan })
      setCurrentPlan(newPlan)
      success(`Plan ${newPlan === 'pro' ? 'upgraded' : 'downgraded'} successfully!`)
      fetchPlan()
    } catch (error) {
      console.error('Failed to upgrade plan:', error)
      showError(error.response?.data?.message || 'Failed to change plan')
    } finally {
      setUpgrading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const plans = [
    {
      name: 'Free',
      id: 'free',
      price: '$0',
      messages: 500,
      aiReplies: 100,
      features: [
        '500 messages/month',
        '100 AI replies/month',
        'Basic analytics',
        'Rule-based replies',
      ],
    },
    {
      name: 'Pro',
      id: 'pro',
      price: '$29',
      messages: 10000,
      aiReplies: 5000,
      features: [
        '10,000 messages/month',
        '5,000 AI replies/month',
        'Advanced analytics',
        'Priority support',
        'Rule-based replies',
      ],
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Plan & Billing</h1>
        <p className="mt-2 text-gray-600">Manage your subscription plan</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.id
          const isUpgrade = plan.id === 'pro' && currentPlan === 'free'
          const isDowngrade = plan.id === 'free' && currentPlan === 'pro'

          return (
            <div
              key={plan.id}
              className={`bg-white shadow rounded-lg p-6 ${
                isCurrent ? 'ring-2 ring-primary-500' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {plan.name}
                  </h3>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {plan.price}
                    {plan.price !== '$0' && (
                      <span className="text-sm font-normal text-gray-500">
                        /month
                      </span>
                    )}
                  </p>
                </div>
                {isCurrent && (
                  <span className="px-3 py-1 text-sm font-medium bg-primary-100 text-primary-800 rounded-full">
                    Current
                  </span>
                )}
              </div>

              <div className="mb-6">
                <div className="text-sm text-gray-600 mb-2">Includes:</div>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <div className="text-sm text-gray-600">
                  <div className="flex justify-between mb-1">
                    <span>Messages:</span>
                    <span className="font-medium">{plan.messages.toLocaleString()}/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AI Replies:</span>
                    <span className="font-medium">{plan.aiReplies.toLocaleString()}/month</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={isCurrent || upgrading}
                className={`w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isCurrent
                    ? 'bg-gray-400 cursor-not-allowed'
                    : isUpgrade
                    ? 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500'
                    : 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500'
                } disabled:opacity-50`}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {isCurrent
                  ? 'Current Plan'
                  : isUpgrade
                  ? 'Upgrade to Pro'
                  : 'Downgrade to Free'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Plan
