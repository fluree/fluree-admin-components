import fetch from 'isomorphic-fetch'
// import { signQuery, signTransaction } from '@fluree/crypto-utils'
// import JSON5 from 'json5'

function gateway() {
  const production = process.env.NODE_ENV === 'production'
  const hosted = process.env.REACT_APP_ENVIRONMENT === 'hosted'
  console.log(hosted)
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
  } else if (hosted) {
    return 'https://staging.db.flur.ee'
  } else {
    return 'http://localhost:8090'
  }
}

function fullEndpoint(info: EndpointParams) {
  const { endpoint, network, db, ip, body } = info
  const hosted = process.env.REACT_APP_ENVIRONMENT === 'hosted'
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
  ].includes(endpoint)

  const startURI = ip

  if (locatedEndpoint) {
    if (endpoint === 'snapshot' && body) {
      return `${startURI}/${endpointInfix}/${body['db/id']}/${endpoint}`
    } else if (endpoint === 'nw-state') {
      return `${startURI}/${endpointInfix}/${endpoint}`
    } else {
      return `${startURI}/${endpointInfix}/${
        hosted ? 'db/' : ''
      }${network}/${db}/${endpoint}`
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
  const { ip, body, network, db, endpoint, headers, auth } = opts
  const fullUri = fullEndpoint({
    endpoint,
    network,
    db,
    body: JSON.stringify(body),
    ip
  })
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
  // eslint-disable-next-line no-debugger
  // debugger
  try {
    const results = await fetch(fullUri, fetchOpts)
    console.log(results)
    const data = await results.json()
    return { data, headers: results.headers, status: results.status }
  } catch (err) {
    return err
  }
}

/**
 * Conform _db.db prop data from hosted or downloaded version
 */
function splitDb(db: string | object): [string, [string, string]] {
  const dbString = typeof db === 'string' ? db : db['db/id']
  return [dbString, dbString.split('/')]
}

export { flureeFetch, gateway, splitDb }
