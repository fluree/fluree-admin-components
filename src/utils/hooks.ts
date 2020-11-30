/* eslint-disable no-debugger */
import { useEffect, useState } from 'react'

type localHook = (storageKey: string) => any

const useLocal: localHook = (storageKey) => {
  const storedState = localStorage.getItem(storageKey)
  const [state, setState] = useState(storedState ? JSON.parse(storedState) : [])
  debugger

  useEffect(() => {
    const storedData = localStorage.getItem(storageKey)

    debugger
    if (storedData !== JSON.stringify(state))
      localStorage.setItem(storageKey, JSON.stringify(state))
  }, [state])
  return [state, setState]
}

export { useLocal }
