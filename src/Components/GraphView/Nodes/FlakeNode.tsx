// eslint-disable-next-line no-unused-vars
import React, { FunctionComponent } from 'react'
import { useTheme } from '@material-ui/core/styles'
// eslint-disable-next-line no-unused-vars
import { GraphNode, Node } from 'react-d3-graph'

// interface NodeShape {
//   _id: string
//   op: boolean
// }
// interface Props {
//   node: NodeShape
// }

interface flakeNode extends GraphNode {
  op: boolean
}

export const FlakeNode: FunctionComponent = (node: flakeNode) => {
  const theme = useTheme()
  const nodeOpts = {
    id: node.id,
    svg: '../../../assets/fluree-logo.svg',
    stroke: theme.palette.primary.main,
    opacity: node.op ? 1 : 0.5,
    className: 'node'
  }
  return <Node {...nodeOpts} />
}
