import React from 'react'
import { Switch, Route } from 'react-router-dom'
import { ThemeProvider, createMuiTheme } from '@material-ui/core'

import { FlureeQL, GraphView } from '@fluree/admin-react'
// import { Graph } from 'react-d3-graph'

const App = () => {
  const theme = createMuiTheme({
    palette: {
      primary: {
        main: '#13C6FF'
      },
      secondary: { main: '#4B56A5' }
    }
  })
  const environment = process.env.REACT_APP_ENVIRONMENT || 'downloaded'
  return (
    <FlureeQL
      allowTransact
      withHistory
      editorMode='json5'
      _db={{
        db: {
          _id: 502895253423,
          'db/id': 'example/mdm',
          'db/active': true
        },
        ip: 'http://localhost:8090',
        dbs: ['example/mdm'],
        environment,
        openApi: true
      }}
      allowKeyGen
      allowSign
    />
  )
}

export default App
