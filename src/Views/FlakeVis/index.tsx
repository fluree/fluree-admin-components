import React, {
  // eslint-disable-next-line no-unused-vars
  FunctionComponent,
  useState,
  useEffect
} from 'react'
import { flureeFetch } from '../../utils/flureeFetch'
import { Graph } from 'react-d3-graph'

interface GraphProps {
  flakes: Array<Array<any>> | null
  _db: DB
  token?: string
}

export const GraphView: FunctionComponent<GraphProps> = ({
  flakes,
  _db,
  token
}) => {
  // const [data, setData] = useState({})
  const [meta, setMeta] = useState<any | null>(null)
  const [metaObj, setMetaObj] = useState<Dictionary>({})
  const [flakeNodes, setFlakeNodes] = useState<Array<any> | null>(null)
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
      if (flakes) {
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
    }
  }, [meta])

  useEffect(() => {
    if (meta && flakeNodes) {
      const relationships: any = []
      for (const flake of flakeNodes) {
        const flakeArray = Object.values(flake)
        flakeArray.forEach((i: any) => {
          if (metaObj[i]) {
            relationships.push({
              source: flake.id,
              // eslint-disable-next-line dot-notation
              target: metaObj[i]['_id'].toString()
            })
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

  console.log({ graphData })

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
  return (
    <div>
      {meta && flakeNodes && graphData && (
        <Graph id='flake-viz' data={graphData} config={{}} />
      )}
    </div>
  )
}
