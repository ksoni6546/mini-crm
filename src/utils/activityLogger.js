import { loadData, saveData } from './storage'

export const logActivity = (type, message) => {
  try {
    const activityLog = loadData('activityLog', [])
    const newLog = {
      id: Date.now(),
      type: type,
      message: message,
      time: new Date().toLocaleString('en-IN')
    }
    
    // Keep only the last 100 activities to prevent localStorage bloat
    const updatedLog = [newLog, ...activityLog].slice(0, 100)
    
    saveData('activityLog', updatedLog)
  } catch (e) {
    console.error('Failed to log activity:', e)
  }
}
