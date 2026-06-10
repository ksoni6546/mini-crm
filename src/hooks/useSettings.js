import { useLocalStorage } from './useLocalStorage'

const defaultSettings = {
  userName: 'Admin User',
  userEmail: 'admin@crmPro.com',
  userPhone: '',
  userRole: 'CRM Manager',
  companyName: 'CRM Pro',
  defaultStatus: 'Active',
  defaultPriority: 'Medium',
  defaultLeadSource: 'Website'
}

export function useSettings() {
  const [settings, setSettings] = useLocalStorage('crmSettings', defaultSettings)
  
  // Merge defaults with saved settings in case new settings were added
  const mergedSettings = { ...defaultSettings, ...settings }
  
  return [mergedSettings, setSettings]
}
