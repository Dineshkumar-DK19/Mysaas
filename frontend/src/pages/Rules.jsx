import { useEffect, useState } from 'react'
import api from '../services/api'
import { useToast } from '../contexts/ToastContext'
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'

const Rules = () => {
  const [rules, setRules] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRule, setEditingRule] = useState(null)
  const [formData, setFormData] = useState({
    keyword: '',
    reply: '',
    enabled: true,
  })
  const { success, error: showError } = useToast()

  useEffect(() => {
    fetchRules()
  }, [])

  const fetchRules = async () => {
    try {
      const response = await api.get('/business/rules')
      setRules(response.data)
    } catch (error) {
      console.error('Failed to fetch rules:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingRule) {
        await api.put(`/business/rules/${editingRule._id}`, formData)
        success('Rule updated successfully!')
      } else {
        await api.post('/business/rules', formData)
        success('Rule created successfully!')
      }
      setShowModal(false)
      setEditingRule(null)
      setFormData({ keyword: '', reply: '', enabled: true })
      fetchRules()
    } catch (error) {
      console.error('Failed to save rule:', error)
      showError(error.response?.data?.message || 'Failed to save rule')
    }
  }

  const handleEdit = (rule) => {
    setEditingRule(rule)
    setFormData({
      keyword: rule.keyword,
      reply: rule.reply,
      enabled: rule.enabled,
    })
    setShowModal(true)
  }

  const handleDelete = async (ruleId) => {
    if (!confirm('Are you sure you want to delete this rule?')) return
    try {
      await api.delete(`/business/rules/${ruleId}`)
      success('Rule deleted successfully!')
      fetchRules()
    } catch (error) {
      console.error('Failed to delete rule:', error)
      showError(error.response?.data?.message || 'Failed to delete rule')
    }
  }

  const handleToggle = async (rule) => {
    try {
      await api.put(`/business/rules/${rule._id}`, {
        ...rule,
        enabled: !rule.enabled,
      })
      fetchRules()
    } catch (error) {
      console.error('Failed to toggle rule:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rules</h1>
          <p className="mt-2 text-gray-600">
            Create keyword-based auto-replies for common questions
          </p>
        </div>
        <button
          onClick={() => {
            setEditingRule(null)
            setFormData({ keyword: '', reply: '', enabled: true })
            setShowModal(true)
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Rule
        </button>
      </div>

      {rules.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <p className="text-gray-500">No rules yet. Create your first rule!</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Keyword
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reply
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rules.map((rule) => (
                <tr key={rule._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {rule.keyword}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {rule.reply}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggle(rule)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {rule.enabled ? (
                        <ToggleRight className="h-5 w-5 text-green-600" />
                      ) : (
                        <ToggleLeft className="h-5 w-5" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(rule)}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(rule._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingRule ? 'Edit Rule' : 'Add Rule'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Keyword
                </label>
                <input
                  type="text"
                  required
                  value={formData.keyword}
                  onChange={(e) =>
                    setFormData({ ...formData, keyword: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="e.g., hello, price, hours"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Reply
                </label>
                <textarea
                  required
                  value={formData.reply}
                  onChange={(e) =>
                    setFormData({ ...formData, reply: e.target.value })
                  }
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="Auto-reply message"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={(e) =>
                    setFormData({ ...formData, enabled: e.target.checked })
                  }
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label className="ml-2 text-sm text-gray-700">Enabled</label>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingRule(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  {editingRule ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Rules
