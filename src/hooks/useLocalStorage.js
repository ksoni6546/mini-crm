import { useState, useEffect, useCallback } from 'react'
import { loadData, saveData } from '../utils/storage'

export function useLocalStorage(key, initialValue) {
  // Read initial value from localStorage or use initialValue
  const [storedValue, setStoredValue] = useState(() => loadData(key, initialValue))

  // Return a wrapped version of useState's setter function that persists the new value
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      saveData(key, valueToStore)
    } catch (error) {
      console.error(error)
    }
  }, [key, storedValue])

  // Listen for changes from other tabs or components
  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(loadData(key, initialValue))
    }

    window.addEventListener('crm:storageUpdated', handleStorageChange)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('crm:storageUpdated', handleStorageChange)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [key, initialValue])

  return [storedValue, setValue]
}
