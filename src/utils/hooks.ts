import { useEffect, useState } from 'react'

type HistoryHook = (storageKey: string) => any
type StorageHook = (storageKey: string, defaultValue?: string) => any

const useLocalHistory: HistoryHook = (storageKey) => {
  const storedState = localStorage.getItem(storageKey)
  const [state, setState] = useState(storedState ? JSON.parse(storedState) : [])

  useEffect(() => {
    const storedData = localStorage.getItem(storageKey)

    if (storedData !== JSON.stringify(state))
      localStorage.setItem(storageKey, JSON.stringify(state))
  }, [state])
  return [state, setState]
}

const useLocalStorage: StorageHook = (storageKey, defaultValue = undefined) => {
  const storedState = localStorage.getItem(storageKey)
  const [state, setState] = useState(defaultValue || storedState || '')

  useEffect(() => {
    const storedData = localStorage.getItem(storageKey)

    if (storedData !== storedState) {
      localStorage.setItem(storageKey, state)
    }
  }, [state])
  return [state, setState]
}

export { useLocalHistory, useLocalStorage }
