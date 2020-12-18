/**
 * Default CSS definition for typescript,
 * will be overridden with file-specific definitions by rollup
 */
declare module '*.css' {
  const content: { [className: string]: string }
  export default content
}

interface SvgrComponent
  extends React.StatelessComponent<React.SVGAttributes<SVGElement>> {}

declare module '*.svg' {
  const svgUrl: string
  const svgComponent: SvgrComponent
  export default svgUrl
  export { svgComponent as ReactComponent }
}

interface DBOject {
  _id: number
  'db/active': boolean
  'db/id': string
}

interface DB {
  account?: string
  db: string | DBOject
  dbs?: Array<string>
  defaultPrivateKey?: any
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

interface FlakeShape {
  s: number
  p: number
  o: number | string
  t: number
  op: boolean
  m: null
}
