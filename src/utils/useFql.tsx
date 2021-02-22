import { useState } from 'react'
import { signQuery, signTransaction, signRequest } from '@fluree/crypto-utils'
import 'isomorphic-fetch'
import { splitDb } from './flureeFetch'

interface Results {
  data?: Record<string, unknown> | Array<Record<string, unknown>>
  status: number | null
  dataString: string
}

interface FQLReturn {
  results: Results
  metadata: FlureeStats | null
  sendUnsigned: (
    endpoint: string,
    body: Record<string, unknown> | Array<Record<string, unknown>>
  ) => void
  requestError: string
  reqErrorOpen: boolean
  setReqErrorOpen: (option: boolean) => void
  sendSignedQuery: (fetchOpts: FetchOptions, sOpts: SignOptions) => void
  sendSignedQueryHosted: (fetchOpts: FetchOptions, sOpts: SignOptions) => void
  sendSignedTx: (fetchOpts: FetchOptions, sOpts: SignOptions) => void
}

/**
 * useFql React hook
 * @param placeholder Provide the default placeholder text to be displayed for results
 * @param _db Object containing the ip for Fluree and the network/db name
 */
export function useFql(placeholder = '', _db: DB): FQLReturn {
  const hosted = _db.environment === 'hosted'
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

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'Request-Timeout': '20000',
    'Access-Control-Allow-Origin': '*'
  }

  const largeTxWarning = () => {
    setResults({
      ...results,
      dataString:
        '// Large transactions may take some time to process.\n // Either wait or check the latest block for results.'
    })
  }

  const parseUrl = (
    // baseUrl: string,
    // network: string,
    // db: string,
    action: string,
    body?: string
  ) => {
    const { ip, db } = _db
    const [network, database] = splitDb(db)[1]
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

    const startURI = ip

    if (locatedEndpoint) {
      if (action === 'snapshot' && body) {
        return `${startURI}/${endpointInfix}/${body['db/id']}/${action}`
      } else if (action === 'nw-state') {
        return `${startURI}/${endpointInfix}/${action}`
      } else {
        return `${startURI}/${endpointInfix}/${
          hosted ? 'db/' : ''
        }${network}/${database}/${action}`
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
    body: Record<string, unknown> | Array<Record<string, unknown>>,
    headers?: Record<string, string>,
    auth?: string
  ) => {
    if (Array.isArray(body) && body.length > 5000) {
      setResults({
        ...results,
        dataString:
          '// Large transactions may take some time to process.\n // Either wait or check the latest block for results.'
      })
    }
    const finalHeaders = headers || {
      'Content-Type': 'application/json',
      'Request-Timeout': '20000',
      'Access-Control-Allow-Origin': '*',
      Authorization: `Bearer ${auth}`
    }
    const fetchOpts = {
      method: 'POST',
      headers: { ...finalHeaders },
      body: JSON.stringify(body)
    }
    console.log({ url, fetchOpts })
    try {
      // debugger
      const response = await fetch(url, fetchOpts)
      console.log(response)
      processResponse(response)
    } catch (err) {
      // debugger
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
      // const data = await response.text()
      // eslint-disable-next-line no-debugger
      // debugger
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
      // debugger
      if (response.statusText) {
        setResults({ dataString: response.statusText, status: response.status })
      } else {
        setRequestError(err.message)
        setReqErrorOpen(true)
      }
    }
  }

  const sendUnsigned = async (
    endpoint: string,
    // network,
    // db,
    // ip,
    // headers,
    body: Record<string, unknown> | Array<Record<string, unknown>>
  ) => {
    if (Array.isArray(body) && body.length > 5000) largeTxWarning()
    const url = parseUrl(endpoint)
    const headers = defaultHeaders
    if (_db.token) {
      headers.Authorization = `Bearer ${_db.token}`
    }
    const results = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    })
    processResponse(results)
    // fetchRequest(url, body, headers, auth)
  }

  const sendSignedQuery = async (
    fetchOpts: FetchOptions,
    { dbName, privateKey }: SignOptions
  ) => {
    const { body, endpoint, ip } = fetchOpts
    // debugger
    const signedOpts = signQuery(
      privateKey,
      JSON.stringify(body),
      endpoint,
      ip,
      dbName
    )
    console.log({ fetchOpts, signedOpts })
    const url = parseUrl(endpoint)
    const requestOpts = signRequest(
      'POST',
      url,
      JSON.stringify(body),
      privateKey,
      fetchOpts.auth
    )
    console.log({ requestOpts })
    // fetchRequest(url, body, signedOpts.headers, fetchOpts.auth)
    const results = await fetch(url, requestOpts)
    // fetchRequest(url, body, requestOpts.headers, fetchOpts.auth)
    processResponse(results)
  }

  const sendSignedQueryHosted = async (
    fetchOpts: FetchOptions,
    { privateKey }: SignOptions
  ) => {
    const { body, endpoint } = fetchOpts
    const url = parseUrl(endpoint)
    const signedOpts = signRequest(
      'POST',
      url,
      JSON.stringify(body),
      privateKey,
      undefined
      // fetchOpts.auth
    )
    signedOpts.headers = {
      ...signedOpts.headers,
      Authorization: `Bearer ${fetchOpts.auth}`
    }
    // eslint-disable-next-line no-debugger
    debugger
    try {
      const results = await fetch(url, signedOpts)
      processResponse(results)
    } catch (err) {
      console.log(err)
      // eslint-disable-next-line no-debugger
      debugger
    }
  }

  const sendSignedTx = (
    fetchOpts: FetchOptions,
    { authId, dbName, expire, maxFuel, nonce, privateKey }: SignOptions
  ) => {
    const { endpoint } = fetchOpts
    fetchOpts.body = signTransaction(
      authId,
      dbName,
      expire,
      maxFuel,
      nonce,
      privateKey,
      JSON.stringify(fetchOpts.body)
    )
    const url = parseUrl(endpoint)
    fetchRequest(url, fetchOpts.body, fetchOpts.headers, fetchOpts.auth)
  }

  return {
    results,
    metadata,
    sendUnsigned,
    sendSignedQuery,
    sendSignedQueryHosted,
    requestError,
    reqErrorOpen,
    setReqErrorOpen,
    sendSignedTx
  }
}
