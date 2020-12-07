import React from 'react'

import { FlureeQL } from 'fluree-admin-components'

const App = () => {
  const environment = process.env.REACT_APP_ENVIRONMENT || 'downloaded'
  return (
    <FlureeQL
      allowTransact
      withHistory
      jsonMode='json5'
      _db={{
        db: 'example/mdm',
        ip: 'http://localhost:8090',
        dbs: ['example/mdm'],
        environment
      }}
    />
  )
}

export default App
