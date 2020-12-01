import React from 'react'

import { FlureeQL } from 'fluree-admin-components'

const App = () => {
  return (
    <FlureeQL
      allowTransact
      _db={{
        db: 'example/mdm',
        ip: 'http://localhost:8090',
        dbs: ['example/mdm']
      }}
    />
  )
}

export default App
