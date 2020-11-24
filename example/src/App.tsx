import React from 'react'

import { FlureeQL } from 'fluree-admin-components'
import 'fluree-admin-components/dist/index.css'

const App = () => {
  return (
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
  )
}

export default App
