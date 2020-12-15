import React from 'react'
import { Graph } from 'react-d3-graph'

const dummyData = {
  nodes: [
    { id: 'flake0' },
    { id: 'flake1' },
    { id: 'flake2' },
    { id: 'flake3' },
    { id: 'flake4' },
    { id: 'flake5' },
    { id: 'flake6' },
    { id: 'flake7' },
    { id: '50' },
    { id: '99' },
    { id: '100' },
    { id: '101' },
    { id: '103' },
    { id: '106' },
    { id: '107' },
    { id: '108' },
    { id: '105553116266496' },
    { id: '87960930223081' },
    { id: '-13' }
  ],
  links: [
    { source: 'flake0', target: '87960930223081' },
    { source: 'flake0', target: '50' },
    { source: 'flake0', target: '-13' },
    { source: 'flake1', target: '-13' },
    { source: 'flake1', target: '99' },
    { source: 'flake1', target: '-13' },
    { source: 'flake2', target: '-13' },
    { source: 'flake2', target: '100' },
    { source: 'flake2', target: '-13' },
    { source: 'flake3', target: '-13' },
    { source: 'flake3', target: '101' },
    { source: 'flake3', target: '105553116266496' },
    { source: 'flake3', target: '-13' },
    { source: 'flake4', target: '-13' },
    { source: 'flake4', target: '103' },
    { source: 'flake4', target: '-13' },
    { source: 'flake5', target: '-13' },
    { source: 'flake5', target: '106' },
    { source: 'flake5', target: '-13' },
    { source: 'flake6', target: '-13' },
    { source: 'flake6', target: '107' },
    { source: 'flake6', target: '-13' },
    { source: 'flake7', target: '-13' },
    { source: 'flake7', target: '108' },
    { source: 'flake7', target: '-13' }
  ]
}

export const Tester = () => {
  return <Graph id='test' data={dummyData} />
}
