import { useEffect, useState } from 'react'
import api from '../services/api'
import { useToast } from '../contexts/ToastContext'
import { Save, CheckCircle } from 'lucide-react'

const Settings = () => {
  const [settings, setSettings] = useState({
    autoReply: true,
    aiTone: 'friendly',
    fallbackMessage: "Thanks for contacting us. We'll get back to you shortly.",
    businessHours: {
      start: '09:00',
      end: '18:00',
    },
  })
  const [whatsappPhoneNumberId, setWhatsappPhoneNumberId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const { success, error: showError } = useToast()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const [settingsRes, businessRes] = await Promise.all([
        api.get('/business/settings'),
        api.get('/business'),
      ])
      setSettings(settingsRes.data)
      setWhatsappPhoneNumberId(businessRes.data.whatsappPhoneNumberId || '')
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await api.put('/business/settings', settings)
      if (whatsappPhoneNumberId) {
        await api.put('/business/whatsapp/phone-number', {
          whatsappPhoneNumberId,
        })
      }
      setSaved(true)
      success('Settings saved successfully!')
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Failed to save settings:', error)
      showError(error.response?.data?.message || 'Failed to save settings')
    } finally {
      setSaving(false)
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">Manage your business settings</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        {/* Auto Reply */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.autoReply}
              onChange={(e) =>
                setSettings({ ...settings, autoReply: e.target.checked })
              }
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">
              Enable Auto Reply
            </span>
          </label>
          <p className="mt-1 text-sm text-gray-500">
            Automatically reply to incoming messages using AI or rules
          </p>
        </div>

        {/* AI Tone */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            AI Reply Tone
          </label>
          <select
            value={settings.aiTone}
            onChange={(e) =>
              setSettings({ ...settings, aiTone: e.target.value })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option value="friendly">Friendly</option>
            <option value="formal">Formal</option>
            <option value="sales">Sales</option>
          </select>
        </div>

        {/* Fallback Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Fallback Message
          </label>
          <textarea
            value={settings.fallbackMessage}
            onChange={(e) =>
              setSettings({ ...settings, fallbackMessage: e.target.value })
            }
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="Message to send when AI fails"
          />
        </div>

        {/* Business Hours */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Hours
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Start</label>
              <input
                type="time"
                value={settings.businessHours.start}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    businessHours: {
                      ...settings.businessHours,
                      start: e.target.value,
                    },
                  })
                }
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">End</label>
              <input
                type="time"
                value={settings.businessHours.end}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    businessHours: {
                      ...settings.businessHours,
                      end: e.target.value,
                    },
                  })
                }
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* WhatsApp Phone Number ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            WhatsApp Phone Number ID
          </label>
          <input
            type="text"
            value={whatsappPhoneNumberId}
            onChange={(e) => setWhatsappPhoneNumberId(e.target.value)}
            placeholder="Your Meta WhatsApp Phone Number ID"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
          <p className="mt-1 text-sm text-gray-500">
            Get this from your Meta WhatsApp Business account
          </p>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {saved ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Saved!
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Settings'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings
