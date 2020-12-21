import { useEffect, useState } from 'react'
// import { flureeFetch } from './flureeFetch'

type HistoryHook = (storageKey: string) => any
type StorageHook = (storageKey: string, defaultValue?: string) => any
type FlureeHook = (
  db: DB,
  action: 'query' | 'tx',
  signed?: SignOptions,
  queryType?: string
) => any
interface dbObj {
  _id: number
  'db/active': boolean
  'db/id': string
}

interface SignOptions {
  chosenAuth?: string | null
  expire?: number
  fuel?: number
  nonce?: number
  privateKey?: string
}

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

// openQuery
// openTx
// signedQuery
// singedTx

// possible FlureeFetch hook
// return results string, function to set new query/tx body
// change body, http request is sent to Fluree ledger, changes
// results state with response data
// signed param includes keys, auth info for signed tx/queries
const useFluree: FlureeHook = (_db, action, signed, queryType) => {
  const {
    // ip,
    db
    // openApi,
    // defaultPrivateKey,
    // token
  } = _db
  const dbName = splitDb(db)
  const [body, setBody] = useState('')
  const [results, setResults] = useState('')
  console.log(signed)

  useEffect(() => {
    if (body) {
      if (action === 'query') {
        setResults(`you did a ${queryType} query` + body + dbName)
      }
    } else {
      setResults(`you did a tx` + body + dbName)
    }
  }, [body])

  return [results, setBody]
}

const splitDb = (db: string | dbObj) => {
  if (typeof db === 'string') {
    return db.split('/')
  } else {
    return db['db/id'].split('/')
  }
}

export { useLocalHistory, useLocalStorage, useFluree }
