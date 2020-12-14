import React, {
  // eslint-disable-next-line no-unused-vars
  FunctionComponent,
  useState,
  useEffect
} from 'react'
import { GraphComponent } from './GraphComponent'
import { flureeFetch } from '../utils/flureeFetch'

interface GraphProps {
  flakes: Array<Array<any>>
  _db: DB
  token?: string
}

// const dummyData = {
//   nodes: [
//     { id: 'flake0' },
//     { id: 'flake1' },
//     { id: 'flake2' },
//     { id: 'flake3' },
//     { id: 'flake4' },
//     { id: 'flake5' },
//     { id: 'flake6' },
//     { id: 'flake7' },
//     { id: '50' },
//     { id: '99' },
//     { id: '100' },
//     { id: '101' },
//     { id: '103' },
//     { id: '106' },
//     { id: '107' },
//     { id: '108' },
//     { id: '105553116266496' },
//     { id: '87960930223081' },
//     { id: '-13' }
//   ],
//   links: [
//     { source: 'flake0', target: '87960930223081' },
//     { source: 'flake0', target: '50' },
//     { source: 'flake0', target: '-13' },
//     { source: 'flake1', target: '-13' },
//     { source: 'flake1', target: '99' },
//     { source: 'flake1', target: '-13' },
//     { source: 'flake2', target: '-13' },
//     { source: 'flake2', target: '100' },
//     { source: 'flake2', target: '-13' },
//     { source: 'flake3', target: '-13' },
//     { source: 'flake3', target: '101' },
//     { source: 'flake3', target: '105553116266496' },
//     { source: 'flake3', target: '-13' },
//     { source: 'flake4', target: '-13' },
//     { source: 'flake4', target: '103' },
//     { source: 'flake4', target: '-13' },
//     { source: 'flake5', target: '-13' },
//     { source: 'flake5', target: '106' },
//     { source: 'flake5', target: '-13' },
//     { source: 'flake6', target: '-13' },
//     { source: 'flake6', target: '107' },
//     { source: 'flake6', target: '-13' },
//     { source: 'flake7', target: '-13' },
//     { source: 'flake7', target: '108' },
//     { source: 'flake7', target: '-13' }
//   ]
// }

export const GraphView: FunctionComponent<GraphProps> = ({
  flakes,
  _db,
  token
}) => {
  // const [data, setData] = useState({})
  const [meta, setMeta] = useState<any>([])
  const [metaObj, setMetaObj] = useState({})
  const [flakeNodes, setFlakeNodes] = useState<Array<any>>([])
  const [graphData, setGraphData] = useState<any>(null)
  // const [mounted, setMounted] = useState(false)

  console.log({ meta, flakeNodes, graphData })

  const fetchData = async (query: object) => {
    try {
      const { ip, db } = _db
      const dbName = typeof db === 'string' ? db : db['db/id']
      const fullDb = dbName.split('/')
      const opts = {
        ip,
        body: query,
        token,
        network: fullDb[0],
        db: fullDb[1],
        endpoint: 'multi-query'
      }
      const results = await flureeFetch(opts)
      console.log(results)
      setMetaObj(results.data)
      const conformMeta = Object.values(results.data)
        .filter((item) => item !== null)
        .map((item: any) => ({ id: item._id, ...item }))
      setMeta(conformMeta)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    if (flakes) {
      const ids = {}

      for (const flake of flakes) {
        for (const f of flake) {
          if (typeof f === 'number' && !ids[f]) {
            ids[f] = { selectOne: ['*'], from: f }
          }
        }
      }
      fetchData(ids)
    }
  }, [flakes])

  useEffect(() => {
    if (meta) {
      const flakeArray = flakes.map((flake, i) => ({
        id: 'flake' + i,
        subject: flake[0],
        predicate: flake[1],
        object: flake[2],
        transactionRef: flake[3],
        op: flake[4],
        m: flake[5]
      }))
      setFlakeNodes(flakeArray)
    }
  }, [meta])

  useEffect(() => {
    if (meta && flakeNodes) {
      const relationships: any = []
      for (const flake of flakeNodes) {
        const flakeArray = Object.values(flake)
        console.log({ [flake.id]: flakeArray })
        flakeArray.forEach((i: any) => {
          if (metaObj[i]) {
            relationships.push({ source: flake.id, target: metaObj[i]._id })
          }
        })
      }
      const data = {
        nodes: [
          ...flakeNodes.map((f: any) => ({
            id: typeof f.id === 'string' ? f.id : f.id.toString()
          })),
          ...meta.map((m: any) => ({
            id: typeof m.id === 'string' ? m.id : m.id.toString()
          }))
        ],
        links: relationships
      }
      console.log({ data })
      setGraphData(data)
      // setMounted(true)
    }
  }, [flakeNodes])

  // const relationships = []
  // for (const flake of flakes) {
  //   for (const f of Object.values(flake)) {
  //     if (metadata[f]) {
  //       relationships.push({ source: flake['id'], target: metadata[f]['id'] })
  //     }
  //   }
  // }
  // const data = {
  //   nodes: [...flakes, ...metadata]
  // links: [{ source: 'harry', target: 'sally' }]
  // }
  return <div>{graphData && <GraphComponent data={graphData} />}</div>
}
