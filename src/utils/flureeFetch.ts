import fetch from 'isomorphic-fetch'
// import JSON5 from 'json5'

interface EndpointParams {
  endpoint: string
  network: string
  db: string
  body?: object
  ip: string
}

interface FetchOptions {
  ip: string
  body: object
  auth?: string | undefined
  network: string
  db: string
  endpoint: string
  headers?: object | undefined
  noRedirect?: boolean
}

function gateway() {
  const production = process.env.NODE_ENV === 'production'
  // production build is same for prod, staging & test environments

  if (production) {
    return window.location.origin
      ? window.location.origin
      : window.location.port
      ? window.location.protocol +
        '//' +
        window.location.hostname +
        ':' +
        window.location.port
      : window.location.protocol + '//' + window.location.hostname
  } else {
    return 'http://localhost:8090'
  }
}

function fullEndpoint(info: EndpointParams) {
  const { endpoint, network, db, body } = info
  const endpointInfix = 'fdb'

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
  ].includes(endpoint)

  const startURI = gateway()

  if (locatedEndpoint) {
    if (endpoint === 'snapshot' && body) {
      return `${startURI}/${endpointInfix}/${body['db/id']}/${endpoint}`
    } else if (endpoint === 'nw-state') {
      return `${startURI}/${endpointInfix}/${endpoint}`
    } else {
      return `${startURI}/${endpointInfix}/${network}/${db}/${endpoint}`
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
  ].includes(endpoint)

  if (prefixedEndpoints) {
    return `${startURI}/${endpointInfix}/${endpoint}`
  }

  if (endpoint === 'logs') {
    return `${startURI}/${endpointInfix}/fdb/${endpoint}/${network}`
  }
  throw new Error('400 - Invalid Endpoint')
}

async function flureeFetch(opts: FetchOptions) {
  const { ip, body, auth, network, db, endpoint, headers } = opts
  const fullUri = fullEndpoint({ endpoint, network, db, body, ip })
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
  try {
    const results = await fetch(fullUri, fetchOpts)
    const data = await results.json()
    return { data, headers: results.headers, status: results.status }
  } catch (err) {
    return err
  }
}

export { flureeFetch, gateway }
