import { useEffect, useState } from 'react'

type localHook = (storageKey: string) => any

const useLocalHistory: localHook = (storageKey) => {
  const storedState = localStorage.getItem(storageKey)
  const [state, setState] = useState(storedState ? JSON.parse(storedState) : [])

  useEffect(() => {
    const storedData = localStorage.getItem(storageKey)

    if (storedData !== JSON.stringify(state))
      localStorage.setItem(storageKey, JSON.stringify(state))
  }, [state])
  return [state, setState]
}

export { useLocalHistory }
