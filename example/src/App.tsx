import React from 'react'
import { Switch, Route } from 'react-router-dom'

import { FlureeQL, GraphView } from '@fluree/admin-react'

const App = () => {
  const environment = process.env.REACT_APP_ENVIRONMENT || 'downloaded'
  return (
    <Switch>
      <Route path='/' exact>
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
            environment
          }}
        />
      </Route>
      <Route path='/flake' exact>
        <GraphView
          flakes={[
            [87960930223080, 50, 'nerqrwUser', -3, true, null],
            [
              -3,
              99,
              'd366791b4060c4cefc8f2557eb5e04b38798ffc6c6e92b21e757eebae431dcbb',
              -3,
              true,
              null
            ],
            [
              -3,
              100,
              '9e73b098f6f345f3cf6e15e286f7a0a2417c973fe96a204154de43254818b13e',
              -3,
              true,
              null
            ],
            [-3, 101, 105553116266496, -3, true, null],
            [-3, 103, 1607979566008, -3, true, null],
            [
              -3,
              106,
              '{"type":"tx","db":"new/test","tx":[{"_id":"_user","username":"nerqrwUser"}],"nonce":1607979566008,"auth":"TfHm98wymWwbdRAAZu3AAC7TDrvQrV56v51","expire":1607979596020}',
              -3,
              true,
              null
            ],
            [
              -3,
              107,
              '1b3045022100b0639837f1a76e028ee22290d65263caad422d62be3aa80ebc71cabbd6dbf21d0220510f09be6e661a78457965be1526ba08dbea162a3623d29fa394e7b0e8cba0b9',
              -3,
              true,
              null
            ],
            [-3, 108, '{"_user$1":87960930223080}', -3, true, null]
          ]}
          _db={{
            db: {
              _id: 502895253423,
              'db/id': 'example/mdm',
              'db/active': true
            },
            ip: 'http://localhost:8090',
            dbs: ['example/mdm'],
            environment
          }}
        />
      </Route>
    </Switch>
  )
}

export default App
