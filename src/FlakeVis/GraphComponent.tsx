// eslint-disable-next-line no-unused-vars
import React, { FunctionComponent } from 'react'
import { Graph } from 'react-d3-graph'

interface Props {
  data: any
}

export const GraphComponent: FunctionComponent<Props> = ({ data }) => {
  return <Graph id='flake-data' data={data} />
}
