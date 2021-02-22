/* eslint-disable no-debugger */
import { useEffect, useState } from 'react'

type HistoryHook = (storageKey: string) => any
type StorageHook = (storageKey: string, defaultValue?: any) => any

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

const useSavedState: StorageHook = (storageKey, defaultValue = undefined) => {
  const storedState = localStorage.getItem(storageKey)
  let notString: any
  try {
    notString = storedState && JSON.parse(storedState)
  } catch {
    notString = storedState
  }
  const [state, setState] = useState(notString || defaultValue)

  useEffect(() => {
    const storedData = localStorage.getItem(storageKey)

    if (storedData !== state) {
      localStorage.setItem(
        storageKey,
        state && state.length && state.length > 5000
          ? '// Values greater than 5k are not saved in the admin UI.'
          : state
      )
    }
  }, [state])
  return [state, setState]
}

export { useLocalHistory, useSavedState }
