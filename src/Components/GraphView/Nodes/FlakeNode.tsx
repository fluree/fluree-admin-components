// eslint-disable-next-line no-unused-vars
import React, { FunctionComponent } from 'react'
import { useTheme } from '@material-ui/core/styles'
// eslint-disable-next-line no-unused-vars
import { Node } from 'react-d3-graph'

interface Props {
  node: FlakeShape
  id: string | number
}

export const FlakeNode: FunctionComponent<Props> = ({ node, id }) => {
  const theme = useTheme()
  const nodeOpts = {
    id: id,
    svg: '../../../assets/fluree-logo.svg',
    stroke: theme.palette.primary.main,
    opacity: node.t ? 1 : 0.5,
    className: 'node'
  }
  return <Node {...nodeOpts} />
}
