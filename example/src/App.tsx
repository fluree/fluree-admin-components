import React from 'react'
// import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles'
// import flureeTheme from 'fluree-mui-theme'

import { FlureeQL } from 'fluree-admin-components'
import 'fluree-admin-components/dist/index.css'

const App = () => {
  // const theme = createMuiTheme(flureeTheme)

  return (
    // <ThemeProvider theme={theme}>
    <FlureeQL
      allowTransact
      _db={{
        db: 'example/mdm',
        ip: 'http://localhost:8090',
        openApi: true,
        environment: 'downloaded',
        account: 'F',
        dbs: ['example/mdm']
      }}
    />
    // </ThemeProvider>
  )
}

export default App
