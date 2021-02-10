/**
 * Default CSS definition for typescript,
 * will be overridden with file-specific definitions by rollup
 */
declare module '*.css' {
  const content: { [className: string]: string }
  export default content
}
// interface SvgrComponent
//   extends React.StatelessComponent<React.SVGAttributes<SVGElement>> {}

// declare module '*.svg' {
//   const svgUrl: string
//   const svgComponent: SvgrComponent
//   export default svgUrl
//   export { svgComponent as ReactComponent }
// }

interface DBObject {
  _id: number
  'db/active': boolean
  'db/id': string
}

interface DB {
  account?: string
  db: string | DBObject
  dbs?: Array<string>
  defaultPrivateKey?: string
  displayError?: string
  environment?: string
  ip: string // url for fluree instance
  loading?: boolean
  logout?: boolean
  openApi?: boolean
  openApiServer?: boolean
  token?: string
}

type Dictionary = { [index: string]: Array<string> }

type Flake = [number, number, number | string, number, boolean, null]

interface FetchOptions {
  ip: string
  body: Record<string, unknown>
  auth?: string | undefined
  network: string
  db: string
  endpoint: string
  headers?: Record<string, string>
  noRedirect?: boolean
}

interface FlakeShape {
  s: number
  p: number
  o: number | string
  t: number
  op: boolean
  m: null
}

interface SignedTransactionForm {
  maxFuel: string
  nonce: string
  expire: string
  privateKey: string
  auth: string | null
}

interface EndpointParams {
  endpoint: string
  network: string
  db: string
  ip: string
  body?: string
}

type Endpoints =
  | 'query'
  | 'multi-query'
  | 'block'
  | 'history'
  | 'transact'
  | 'graphql'
  | 'sparql'
  | 'sql'
  | 'command'
  | 'snapshot'
  | 'ledger-stats'
  | 'block-range-with-txn'
  | 'nw-state'
  | 'list-snapshots'

interface FlureeStats {
  fuel?: string | number
  block?: string | number
  time?: string
  status?: string | number
  remainingFuel?: string | number
}

interface SignOptions {
  authId?: string
  dbName: string
  expire?: string | number
  maxFuel?: string | number
  nonce?: string | number
  privateKey: string
}

interface FQLProps {
  _db: DB
  allowTransact?: boolean
  withHistory?: boolean
  editorMode?: 'json' | 'json5' | 'yaml'
  token?: string
  allowKeyGen?: boolean
  allowSign?: boolean
}

// type QueryType = 'Query' | 'Block' | 'Multi-Query' | 'History'
type QueryType = string | undefined | null

interface QueryTypes {
  Query: [string, Record<string, unknown>]
  Block: [string, Record<string, unknown>]
  'Multi-Query': [string, Record<string, unknown>]
  History: [string, Record<string, unknown>]
}

interface EditorProps {
  name?: string
  value?: string
  theme?: 'dracula' | 'xcode'
  mode?: 'json' | 'json5' | 'sparql' | 'yaml'
  title?: string
  readOnly?: boolean
  width?: number | string
  action?: string
  stats?: FlureeStats | null
  height?: string
  size?: 'small' | 'medium'
  onChange?: (value: string) => void
}

interface StatTextProps {
  label: string
  value: string
}

interface StatDisplayProps {
  stats: object
}

interface SignQueryProps {
  keyValue: string
  hostValue: string
  keyChange: (event: any) => void
  hostChange: (event: any) => void
}

interface AuthShape {
  id: string
  _id: number
}

interface GenerateKeysProps {
  _db: DB
  token?: string
}

interface HistoryProps {
  history: Array<HistoryObject> | null | undefined
  loadHistoryItem?: (
    action: string,
    param: object,
    type?: string | null
  ) => void | undefined
}

interface HistoryObject {
  action: string
  param: object
  type?: string
}

interface GenKeysDialogProps {
  open: boolean
  onClose: () => void
  // _db: DB
  // token?: string
}
