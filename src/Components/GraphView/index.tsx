import React, {
  // eslint-disable-next-line no-unused-vars
  FunctionComponent,
  useState,
  useEffect
} from 'react'
// import { flureeFetch } from '../../utils/flureeFetch'
import { useTheme } from '@material-ui/core/styles'
import { Popper } from '@material-ui/core'
import { NodeCard } from './NodeCard'
import { Graph } from 'react-d3-graph'
import { parseDrift, createGraph } from '../../utils/helpers'

interface GraphProps {
  flakes: Array<Flake> | null
  _db: DB
  token?: string
}

export const GraphView: FunctionComponent<GraphProps> = ({
  flakes,
  _db,
  token
}) => {
  const theme = useTheme()
  const [graphData, setGraphData] = useState<any>(null)
  const [shapedFlakes, setFlakes] = useState<Array<FlakeShape> | null>(null)
  const [meta, setMeta] = useState<object | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<object | null>(null)
  const [flakeVis, setFlakeVis] = useState<object | null>(null)
  const [popperOpen, setPopperOpen] = useState(false)

  const getData = async () => {
    const { ip, db } = _db
    const dbName = typeof db === 'string' ? db : db['db/id']
    const fullDb = dbName.split('/')
    const opts = {
      ip,
      token,
      network: fullDb[0],
      db: fullDb[1],
      endpoint: 'multi-query'
    }
    const data = await parseDrift(flakes, opts)
    if (data) {
      setFlakes(data.shapedDrift)
      setMeta(data.metaResults)
    }
  }

  useEffect(() => {
    getData()
  }, [flakes])

  useEffect(() => {
    if (meta && shapedFlakes) {
      const graph = createGraph(shapedFlakes, meta, theme)
      console.log(graph)
      setGraphData(graph)
    }
  }, [meta])

  function handleNodeClick(event: any) {
    console.log(event)
    setSelectedId(event)
  }

  function handleClickAway() {
    setPopperOpen(false)
  }

  function handleHoverLink(source: string, target: string) {
    console.log([source, target])
  }

  useEffect(() => {
    if (selectedId) {
      if (shapedFlakes && selectedId.includes('flake')) {
        const flakeIndex = selectedId.slice(5)
        const node: FlakeShape = shapedFlakes[flakeIndex]
        if (meta) {
          const visualizeNode = {
            s: meta[node.s] ? JSON.stringify(meta[node.s], null, 2) : node.s,
            p: meta[node.p] ? JSON.stringify(meta[node.p], null, 2) : node.p,
            o: meta[node.o] ? JSON.stringify(meta[node.o], null, 2) : node.o,
            t: node.t,
            op: node.op,
            m: node.m
          }
          setFlakeVis(visualizeNode)
        }
        setSelectedNode(node)
      } else if (meta && meta[selectedId.toString()]) {
        const node = meta[selectedId.toString()]
        setSelectedNode(node)
      }
      setPopperOpen(true)
    }
  }, [selectedId])

  return (
    <div style={{ maxWidth: 'inherit', width: '100%', margin: '0 auto' }}>
      {graphData && (
        <Graph
          id='flake-viz'
          data={graphData}
          config={{ height: 900, width: 1200 }}
          onClickNode={handleNodeClick}
          onClickGraph={handleClickAway}
          onMouseOverLink={handleHoverLink}
        />
      )}
      <Popper open={popperOpen}>
        {selectedNode && selectedId && (
          <NodeCard
            nodeId={selectedId}
            node={selectedNode}
            altNode={flakeVis}
          />
        )}
      </Popper>
    </div>
  )
}
