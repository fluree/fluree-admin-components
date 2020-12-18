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
  height?: number
  width?: number
}

export const GraphView: FunctionComponent<GraphProps> = ({
  flakes,
  _db,
  token,
  height = 400,
  width = 800
}) => {
  const theme = useTheme()
  const [graphData, setGraphData] = useState<any>(null)
  const [shapedFlakes, setFlakes] = useState<Array<FlakeShape> | null>(null)
  const [meta, setMeta] = useState<object | null>(null)
  const [selectedId] = useState<string | null>(null)
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
    // setSelectedId(event)
  }

  function onClickGraph(event: any) {
    console.log(event)
    return event
  }

  function onNodePositionChange(nodeId: string, x: number, y: number) {
    console.log({ nodeId, x, y })
  }

  useEffect(() => {
    setFlakeVis(null)
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

  // const d3Config = {
  //   nodeHighlightBehavior: true,
  //   linkHighlightBehavior: true,
  //   staticGraph: false,
  //   link: {
  //     highlightColor: theme.palette.secondary.main
  //     // type: 'CURVE_SMOOTH',
  //     // renderLabel: true
  //   },
  //   height: height,
  //   width: width,
  //   d3: {
  //     alphaTarget: 0.05,
  //     gravity: -200,
  //     linkLength: 100,
  //     linkStrength: 1,
  //     disableLinkForce: false
  //   },
  //   node: {
  //     // viewGenerator: NodeView
  //   }
  // }

  return (
    <div style={{ maxWidth: 'inherit', width: '100%', margin: '0 auto' }}>
      {graphData && (
        <Graph
          id='flake-viz'
          data={graphData}
          onClickNode={handleNodeClick}
          onClickGraph={onClickGraph}
          // onMouseOverLink={handleHoverLink}
          onNodePositionChange={onNodePositionChange}
          config={{
            automaticRearrangeAfterDropNode: false,
            collapsible: false,
            directed: false,
            focusAnimationDuration: 0.75,
            focusZoom: 1,
            height: height,
            highlightDegree: 1,
            highlightOpacity: 1,
            linkHighlightBehavior: false,
            maxZoom: 8,
            minZoom: 0.1,
            nodeHighlightBehavior: false,
            panAndZoom: false,
            staticGraph: false,
            staticGraphWithDragAndDrop: false,
            width: width,
            d3: {
              alphaTarget: 0.05,
              gravity: -350,
              linkLength: 100,
              linkStrength: 2,
              disableLinkForce: false
            },
            node: {
              color: '#d3d3d3',
              fontColor: 'black',
              fontSize: 8,
              fontWeight: 'normal',
              highlightColor: 'SAME',
              highlightFontSize: 8,
              highlightFontWeight: 'normal',
              highlightStrokeColor: 'SAME',
              highlightStrokeWidth: 'SAME',
              labelProperty: 'id',
              mouseCursor: 'pointer',
              opacity: 1,
              renderLabel: true,
              size: 200,
              strokeColor: 'none',
              strokeWidth: 1.5,
              svg: '',
              symbolType: 'circle'
            },
            link: {
              color: '#d3d3d3',
              fontColor: 'black',
              fontSize: 8,
              fontWeight: 'normal',
              highlightColor: 'SAME',
              highlightFontSize: 8,
              highlightFontWeight: 'normal',
              labelProperty: 'color',
              mouseCursor: 'pointer',
              opacity: 1,
              renderLabel: false,
              semanticStrokeWidth: false,
              strokeWidth: 1.5,
              markerHeight: 6,
              markerWidth: 6
            }
          }}
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
