import React from 'react'

import { FlureeQL } from '@fluree/admin-react'

const App = () => {
  const environment = process.env.REACT_APP_ENVIRONMENT || 'downloaded'
  return (
    <FlureeQL
      allowTransact
      withHistory
      jsonMode='json5'
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
