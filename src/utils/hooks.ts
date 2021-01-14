import { useEffect, useState } from 'react'
import { signQuery, signTransaction } from '@fluree/crypto-utils'
import 'isomorphic-fetch'

type HistoryHook = (storageKey: string) => any
type StorageHook = (storageKey: string, defaultValue?: string) => any
interface Results {
  data?: Record<string, unknown> | Array<Record<string, unknown>>
  status: number | null
  dataString: string
}
interface FQLReturn {
  results: Results
  metadata: FlureeStats | null
  sendUnsigned: (options: FetchOptions) => void
  requestError: string
  reqErrorOpen: boolean
  setReqErrorOpen: (option: boolean) => void
  sendSignedQuery: (fetchOpts: FetchOptions, sOpts: SignOptions) => void
  sendSignedTx: (fetchOpts: FetchOptions, sOpts: SignOptions) => void
}

const hosted = process.env.REACT_APP_ENVIRONMENT === 'hosted'

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

/**
 * useFql React hook
 * @param placeholder Provide the default placeholder text to be displayed for results
 *
 */
const useFql = (placeholder = ''): FQLReturn => {
  const [results, setResults] = useState<Results>({
    data: undefined,
    dataString: placeholder,
    status: null
  })
  const [requestError, setRequestError] = useState('')
  const [reqErrorOpen, setReqErrorOpen] = useState(false)
  const [metadata, setMetadata] = useState<FlureeStats>({
    fuel: undefined,
    status: undefined,
    time: undefined,
    block: undefined
  })

  const parseUrl = (
    baseUrl: string,
    network: string,
    db: string,
    action: string,
    body?: string,
    hosted = false
  ) => {
    const endpointInfix = hosted ? 'api' : 'fdb'

    const locatedEndpoint = [
      'query',
      'multi-query',
      'block',
      'history',
      'transact',
      'graphql',
      'sparql',
      'sql',
      'command',
      'snapshot',
      'ledger-stats',
      'block-range-with-txn',
      'nw-state',
      'list-snapshots'
    ].includes(action)

    const startURI = baseUrl

    if (locatedEndpoint) {
      if (action === 'snapshot' && body) {
        return `${startURI}/${endpointInfix}/${body['db/id']}/${action}`
      } else if (action === 'nw-state') {
        return `${startURI}/${endpointInfix}/${action}`
      } else {
        return `${startURI}/${endpointInfix}/${
          hosted ? 'db/' : ''
        }${network}/${db}/${action}`
      }
    }

    const prefixedEndpoints = [
      'dbs',
      'action',
      'new-db',
      'accounts',
      'signin',
      'health',
      'sub',
      'new-pw',
      'reset-pw',
      'activate-account',
      'delete-db'
    ].includes(action)

    if (prefixedEndpoints) {
      return `${startURI}/${endpointInfix}/${action}`
    }

    if (action === 'logs') {
      return `${startURI}/${endpointInfix}/fdb/${action}/${network}`
    }
    throw new Error('400 - Invalid Endpoint')
  }

  const fetchRequest = async (
    url: string,
    body: Record<string, unknown>,
    headers?: Record<string, string>,
    auth?: string
  ) => {
    const finalHeaders = headers || {
      'Content-Type': 'application/json',
      'Request-Timeout': '20000',
      Authorization: `Bearer ${auth}`
    }
    const fetchOpts = {
      method: 'POST',
      headers: { ...finalHeaders },
      body: JSON.stringify(body)
    }
    console.log({ url, fetchOpts })
    try {
      const response = await fetch(url, fetchOpts)
      console.log(response)
      processResponse(response)
    } catch (err) {
      setRequestError(err.message)
      setReqErrorOpen(true)
    }
  }

  const getStats = (headers: Headers) => {
    const fuel = headers.get('x-fdb-fuel') || undefined
    const block = headers.get('x-fdb-block') || undefined
    const time = headers.get('x-fdb-time') || undefined
    const status = headers.get('x-fdb-status') || undefined
    return {
      fuel,
      block,
      time,
      status
    }
  }

  const processResponse = async (response: Response) => {
    try {
      const data = await response.json()
      const headers = response.headers
      const status = response.status

      if (status >= 500) {
        throw Error(data.message)
      }

      console.log(typeof status)
      const stats = getStats(headers)
      setResults({
        data,
        dataString: JSON.stringify(data, null, 2),
        status: status
      })
      setMetadata(stats)
      console.log({ data, headers, status })
    } catch (err) {
      console.log(err)
      setRequestError(err.message)
      setReqErrorOpen(true)
    }
  }

  const sendUnsigned = ({
    endpoint,
    network,
    db,
    ip,
    auth,
    headers,
    body
  }: FetchOptions) => {
    const url = parseUrl(ip, network, db, endpoint, undefined, hosted)
    fetchRequest(url, body, headers, auth)
  }

  const sendSignedQuery = (
    fetchOpts: FetchOptions,
    { dbName, privateKey }: SignOptions
  ) => {
    console.log({ fetchOpts })
    const { body, endpoint, ip, network, db } = fetchOpts
    const signedOpts = signQuery(
      privateKey,
      JSON.stringify(body),
      endpoint,
      ip,
      dbName
    )
    console.log({ fetchOpts })
    const url = parseUrl(ip, network, db, endpoint, undefined, hosted)
    fetchRequest(url, body, signedOpts.headers, fetchOpts.auth)
  }

  const sendSignedTx = (
    fetchOpts: FetchOptions,
    { authId, dbName, expire, maxFuel, nonce, privateKey }: SignOptions
  ) => {
    const { endpoint, ip, network, db } = fetchOpts
    fetchOpts.body = signTransaction(
      authId,
      dbName,
      expire,
      maxFuel,
      nonce,
      privateKey,
      JSON.stringify(fetchOpts.body)
    )
    const url = parseUrl(ip, network, db, endpoint, undefined, hosted)
    fetchRequest(url, fetchOpts.body, fetchOpts.headers, fetchOpts.auth)
  }

  return {
    results,
    metadata,
    sendUnsigned,
    sendSignedQuery,
    requestError,
    reqErrorOpen,
    setReqErrorOpen,
    sendSignedTx
  }
}

export { useLocalHistory, useLocalStorage, useFql }
