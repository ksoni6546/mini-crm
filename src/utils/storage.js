export const loadData = (key, defaultValue = []) => {
  try {
    const saved = localStorage.getItem(key)
    if (saved) {
      return JSON.parse(saved)
    }
    return defaultValue
  } catch (e) {
    console.error(`Error loading ${key} from localStorage:`, e)
    return defaultValue
  }
}

export const saveData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
    window.dispatchEvent(new Event('crm:storageUpdated'))
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e)
  }
}

export const clearData = (keys) => {
  try {
    if (Array.isArray(keys)) {
      keys.forEach(key => localStorage.removeItem(key))
    } else {
      localStorage.removeItem(keys)
    }
    window.dispatchEvent(new Event('crm:storageUpdated'))
  } catch (e) {
    console.error(`Error clearing data from localStorage:`, e)
  }
}
