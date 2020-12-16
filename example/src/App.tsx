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
            [
              105553116267497,
              60,
              'Tf78E3Duidr4nDf9tdQUA8AJ5mAoR5S7CpJ',
              -13,
              true,
              null
            ],
            [105553116267497, 65, 123145302310912, -13, true, null],
            [
              -13,
              99,
              '1e7747cffc6d6de3351549a0334d0fb3627826b476f6d1065930883d8f816456',
              -13,
              true,
              null
            ],
            [
              -13,
              100,
              '2391bc070067f5d57aa26fe18bef5d02b8d5417348a2d2891289073df59065b5',
              -13,
              true,
              null
            ],
            [-13, 101, 105553116266496, -13, true, null],
            [-13, 103, 1608055496727, -13, true, null],
            [
              -13,
              106,
              '{"type":"tx","db":"example/mdm","tx":[{"_id":"_auth","id":"Tf78E3Duidr4nDf9tdQUA8AJ5mAoR5S7CpJ","roles":[["_role/id","root"]]}],"nonce":1608055496727,"auth":"TfKXH47U4W6UgnxeoPSXsrfEuAt5Lm97DGx","expire":1608055526731}',
              -13,
              true,
              null
            ],
            [
              -13,
              107,
              '1c3045022100d869cfe6662fc2d675d8495ca8ed40fd7be2cdc5922466797cc854b704bf51be022057b07ffa436500bfb5bc51c6c2a9bc2c10ec06c3cb013da865e3289ef9e80c3d',
              -13,
              true,
              null
            ],
            [-13, 108, '{"_auth$1":105553116267497}', -13, true, null],
            [
              -14,
              1,
              'edc778cbd37ce30367462eb0e41d87f95ac5466e4d33b616fa3d436a18d1a3ea',
              -14,
              true,
              null
            ],
            [
              -14,
              2,
              '47e19ce651058c11821e5ffdba0c9587aab6fb6764bd6d409f9425b8dd35e0f0',
              -14,
              true,
              null
            ],
            [-14, 3, -14, -14, true, null],
            [-14, 3, -13, -14, true, null],
            [-14, 4, 105553116266496, -14, true, null],
            [-14, 5, 1608055496746, -14, true, null],
            [-14, 6, 7, -14, true, null],
            [
              -14,
              7,
              '1b3045022100dfb0388c545150729755a7c0d64bd7054e484f821060758765804eb6a08f367302201aa7dc50ee3cdc4c856fb41c25763f72c019ec32f6ae9a1a4bfe4a59ed7fb719',
              -14,
              true,
              null
            ],
            [
              -14,
              99,
              '609d27fab3e13279d54a96defd130ab1a1fdbd227d95349fb0ee6c8ff92960a4',
              -14,
              true,
              null
            ],
            [
              105553116267498,
              60,
              'TfJ9ooDMdJcrCghDzZYVSmNTjRH1nQ9cpa4',
              -15,
              true,
              null
            ],
            [105553116267498, 65, 123145302310912, -15, true, null],
            [
              -15,
              99,
              'eb4d068002d2695ecc0a8bed0c2b960188259e21e48e4480876945f4094d239b',
              -15,
              true,
              null
            ],
            [
              -15,
              100,
              'c82d26a598bfd138306515ec360f3c683eb58179885ca4ddebcaf46a66ee3530',
              -15,
              true,
              null
            ],
            [-15, 101, 105553116266496, -15, true, null],
            [-15, 103, 1608057580823, -15, true, null],
            [
              -15,
              106,
              '{"type":"tx","db":"example/mdm","tx":[{"_id":"_auth","id":"TfJ9ooDMdJcrCghDzZYVSmNTjRH1nQ9cpa4","roles":[["_role/id","root"]]}],"nonce":1608057580823,"auth":"TfKXH47U4W6UgnxeoPSXsrfEuAt5Lm97DGx","expire":1608057610826}',
              -15,
              true,
              null
            ],
            [
              -15,
              107,
              '1b3045022100c6f8d10d633a6414a01bbc0f20fa9f380f1e8e261552d54a04c9cfbcc83292dd022027e1f197a66f76fa079c0ccbc25905121cc033358ee3cf34b77fe589b5febba2',
              -15,
              true,
              null
            ],
            [-15, 108, '{"_auth$1":105553116267498}', -15, true, null],
            [
              -16,
              1,
              '9ab73237ffbc21f7684dcf05eb2e3f9f7bfc9993c4d6eb0613bb568291c0a202',
              -16,
              true,
              null
            ],
            [
              -16,
              2,
              'edc778cbd37ce30367462eb0e41d87f95ac5466e4d33b616fa3d436a18d1a3ea',
              -16,
              true,
              null
            ],
            [-16, 3, -16, -16, true, null],
            [-16, 3, -15, -16, true, null],
            [-16, 4, 105553116266496, -16, true, null],
            [-16, 5, 1608057580834, -16, true, null],
            [-16, 6, 8, -16, true, null],
            [
              -16,
              7,
              '1c30450221009bbe7ea67fde8fddb4792a9f789ae9e41a3e00e3ffdc9033030dcc291b398fe3022078c03e34b9799bec1962452dea2dca56b6e0bc8b8cf941f5e87f904eeb8563f7',
              -16,
              true,
              null
            ],
            [
              -16,
              99,
              'ab992c0f3d1c9eab74302fda6ee7d579e3f9068c883451deaf19bedb2b61db36',
              -16,
              true,
              null
            ]
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
