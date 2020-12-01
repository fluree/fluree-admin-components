// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState, FunctionComponent } from 'react'
import {
  Button,
  ButtonGroup,
  IconButton,
  // FormControl,
  // InputLabel,
  MenuItem,
  Select
} from '@material-ui/core'
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled'
import SplitPane from 'react-split-pane'
import { Editor } from '../Editor'
import History from '../History'
import { makeStyles } from '@material-ui/core/styles'
import { flureeFetch } from '../utils/flureeFetch'
import { useLocal } from '../utils/hooks'
// import { format } from 'path'
// import get from 'lodash'

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 'inherit',
    width: '100%'
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 75
  },
  queryActions: {
    marginLeft: '1%',
    height: 'inherit',
    display: 'inherit',
    alignItems: 'center',
    '& > button': {
      marginRight: 10
    }
  },
  defaultSelect: {
    minWidth: 150
  },
  actionButtons: {
    marginLeft: theme.spacing(1)
  },
  editorPane: {
    display: 'flex',
    marginLeft: '1%'
  },
  split: {
    width: '15px',
    cursor: 'col-resize',
    height: '100%',
    zIndex: 10
  },
  editors: {
    maxWidth: 'inherit',
    width: 'inherit',
    maxHeight: 600
    // position: 'relative'
  },
  editorsSquished: {
    width: '100%',
    // maxWidth: '100%',
    maxHeight: 600,
    position: 'relative'
  },
  history: {
    width: '30%'
  }
}))

interface DB {
  account?: string
  db: string
  dbs: Array<string>
  defaultPrivateKey?: any
  displayError?: string
  environment: string
  ip: string // url for fluree instance
  loading?: boolean
  logout?: boolean
  openApi?: boolean
  openApiServer?: boolean
  token?: string
}

interface Props {
  _db: DB
  allowTransact?: boolean
  defaultQuery?: string
  defaultTransact?: string
}

type Dictionary = { [index: string]: Array<string> }

const queryTypes: Dictionary = {
  Query: [
    'query',
    '{\n  "select": [\n    "*"\n  ],\n  "from": "_collection"\n}'
  ],
  Block: ['block', '{\n  "block": 1\n}'],
  'Multi-Query': [
    'multi-query',
    '{\n  "collections": {\n    "select": [\n      "*"\n    ],\n    "from": "_collection"\n  },\n  "users": {\n    "select": [\n      "*"\n    ],\n    "from": "_user"\n  }\n}'
  ],
  History: ['history', '{\n  "history": []\n}']
}

const FlureeQL: FunctionComponent<Props> = (props) => {
  const classes = useStyles()
  const [action, setAction] = useState('query')
  const [size, setSize] = useState('50%')
  // const theme = useTheme();
  const [queryParam, setQueryParam] = useState('')
  const [queryType, setQueryType] = useState('Query')
  const [txParam, setTxParam] = useState(
    '[{"_id":"_user","username":"newUser"}]'
  )
  const [results, setResults] = useState('')
  // const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    fuel: '',
    status: '',
    block: '',
    time: ''
  })
  const [historyOpen, setHistoryOpen] = useState(true)
  const [history, setHistory] = useLocal(`${props._db.db}_history`)

  // console.log({ stats })
  useEffect(() => {
    setQueryParam(queryTypes[queryType][1])
  }, [queryType])

  const setHistoryHandler = (action: string, param: object) => {
    setAction(action)
    if (action === 'transact') {
      setTxParam(JSON.stringify(param))
    } else {
      setQueryParam(JSON.stringify(param))
    }
  }
  // getParamsFromProps(props) {
  //   //const sign = !props._db.openApi;
  //   let sign;
  //   if (props._db.openApi === false) {
  //     sign = !props._db.openApi;
  //   } else if (props._db.openApiServer === false) {
  //     sign = !props._db.openApiServer;
  //   }
  //   const privateKey = props._db.defaultPrivateKey || '';
  //   const host = getHost(props._db.ip) || '';
  //   const history = loadHistory(props._db.db, 'flureeQL') || [];

  //   const lastItem = getLastHistory(history) || {};
  //   const action = lastItem.action || 'query';

  //   const newState = {
  //     sign: sign,
  //     host: host,
  //     privateKey: privateKey,
  //     history: history,
  //     action: action
  //   };

  //   if (action === 'query') {
  //     newState['queryParam'] =
  //       lastItem.param || '{"select":["*"],"from":"_collection"}';
  //     newState['queryType'] = lastItem.type || 'query';

  //     const lastTransaction = getLastHistoryType(history, 'transact');
  //     newState['txParam'] =
  //       lastTransaction || '[{"_id":"_user","username":"newUser"}]';
  //   } else {
  //     newState['txParam'] =
  //       lastItem.param || '[{"_id":"_user","username":"newUser"}]';
  //     const lastQuery = getLastHistoryAction(history, 'query');
  //     newState['queryParam'] =
  //       lastQuery.param || '{"select":["*"],"from":"_collection"}';
  //     newState['queryType'] = lastQuery.type || 'query';
  //   }

  //   return newState;
  // }

  // const handleResponse = (
  //   promise: any,
  //   // action: string,
  //   // db: string,
  //   // history: null = null,
  //   param: string
  //   // queryType: string
  // ) => {
  //   if (JSON.stringify(param).length > 100000) {
  //     setResults(
  //       JSON.stringify(
  //         [
  //           'Large transactions may take some time to process.',
  //           'Either wait or check the latest block for results.'
  //         ],
  //         null,
  //         2
  //       )
  //     )
  //   }

  //   if (promise.status >= 400) {
  //     // const { displayError } = props._db
  //     const result = promise.message || promise
  //     var formattedResult = JSON.stringify(result, null, 2)
  //     // this.setState({ loading: false, results: formattedResult })
  //     // setLoading(false)
  //     // displayError(result)
  //     setResults(formattedResult)
  //     return
  //   }

  //   promise
  //     .then((res: any) => {
  //       debugger
  //       if (res.status >= 400 || res.status === undefined) {
  //         // const { displayError } = this.props._db
  //         const result = res.message || res
  //         var formattedResult = JSON.stringify(result, null, 2)
  //         // this.setState({ loading: false, results: formattedResult })
  //         // setLoading(false)
  //         setResults(formattedResult)
  //         // displayError(result)
  //         return
  //       }
  //       const results = res.json || res
  //       const fuel = res.headers.get('x-fdb-fuel') || results.fuel
  //       const block = res.headers.get('x-fdb-block') || results.block
  //       const time = res.headers.get('x-fdb-time') || results.time
  //       const status = res.headers.get('x-fdb-status') || results.status
  //       console.log('get fuel', res.headers.get('x-fdb-fuel'))

  //       var formattedResult = JSON.stringify(results.result || results, null, 2)
  //       // const newHistory = pushHistory(
  //       //   db,
  //       //   history,
  //       //   action,
  //       //   param,
  //       //   results,
  //       //   queryType,
  //       //   'flureeQL'
  //       // )
  //       // const isBlockQuery = get(results, [0, 'flakes'], null) ? true : false
  //       // if (action === 'transact' || isBlockQuery) {
  //       //   // attempt to put all flakes on a single line for transaction results
  //       //   formattedResult = formattedResult.replace(
  //       //     /\s{4}\[\n[^\]]+\]/g,
  //       //     function (a, b) {
  //       //       return '    ' + a.replace(/[\s\n]+/g, ' ')
  //       //     }
  //       //   )
  //       // }
  //       // this.setState({
  //       //   results: formattedResult,
  //       //   history: newHistory,
  //       //   loading: false,
  //       //   fuel: fuel,
  //       //   block: block,
  //       //   time: time,
  //       //   status: status
  //       // })
  //       setResults(formattedResult)
  //       // setLoading(false)
  //       // setStats({ fuel, block, time, status })
  //     })
  //     .catch((error: any) => {
  //       // const { displayError } = this.props._db
  //       const result = error.json || error
  //       var formattedResult = JSON.stringify(result, null, 2)
  //       // this.setState({ loading: false, results: formattedResult })
  //       // setLoading(false)
  //       setResults(formattedResult)
  //       // displayError(result)
  //     })

  //   // setLoading(true)
  // }

  const getStats = (res: any) => {
    const fuel = res.headers.get('x-fdb-fuel')
    const block = res.headers.get('x-fdb-block')
    const time = res.headers.get('x-fdb-time')
    const status = res.headers.get('x-fdb-status')
    return {
      fuel,
      block,
      time,
      status
    }
  }

  const flureeHandler = async () => {
    const param: string = action === 'query' ? queryParam : txParam
    let endpoint: string
    if (action === 'query') endpoint = queryTypes[queryType][0]
    else endpoint = 'transact'
    const parsedParam = JSON.parse(param)
    const { ip, db, token } = props._db
    const fullDb = db.split('/')
    const queryParamStore =
      JSON.stringify(queryParam).length > 5000
        ? 'Values greater than 5k are not saved in the admin UI.'
        : queryParam
    const txParamStore =
      JSON.stringify(txParam).length > 5000
        ? 'Values greater than 5k are not saved in the admin UI.'
        : txParam
    localStorage.setItem(db.concat('_queryParam'), queryParamStore)
    localStorage.setItem(db.concat('_txParam'), txParamStore)
    localStorage.setItem(db.concat('_lastAction'), action)
    localStorage.setItem(
      db.concat('_lastType'),
      action === 'query' ? queryType : 'transact'
    )
    const opts = {
      ip,
      body: parsedParam,
      auth: token,
      network: fullDb[0],
      endpoint,
      db: fullDb[1]
    }
    console.log({ opts })
    try {
      const results = await flureeFetch(opts)
      console.log({ results })
      if (results.status < 400) {
        setHistory([{ action: action, param: parsedParam }, ...history])
      }
      setResults(JSON.stringify(results.data, null, 2))
      setStats(getStats(results))
    } catch (err) {
      console.log(err)
    }
    // const formattedResults = JSON.stringify(response.json)
    // setResults(formattedResults)
    // setResults(JSON.stringify(JSON.parse(response.json)))
  }

  return (
    <div className={classes.root}>
      <div className={classes.toolbar}>
        <div className={classes.queryActions}>
          <Button color='primary' variant='outlined'>
            Generate Keys
          </Button>
          <Button color='primary' variant='outlined'>
            Sign
          </Button>
          <Button
            color='primary'
            variant={historyOpen ? 'contained' : 'outlined'}
            onClick={() => {
              setHistoryOpen(!historyOpen)
            }}
          >
            History
          </Button>
          {action === 'query' && (
            <div>
              {/* <FormControl color='primary' margin='none' variant='outlined'> */}
              {/* <InputLabel id='query-type-label'>Query Type</InputLabel> */}
              <Select
                // labelId='query-type-label'
                autoWidth
                value={queryType}
                onChange={(event: any) => setQueryType(event.target.value)}
                className={classes.defaultSelect}
                variant='outlined'
                color='primary'
                margin='dense'
              >
                {Object.keys(queryTypes).map((item) => (
                  <MenuItem value={item} key={item}>
                    {item}
                  </MenuItem>
                ))}
                {/* </FormControl> */}
              </Select>
            </div>
          )}
        </div>
        <div>
          {props.allowTransact && (
            <ButtonGroup>
              <Button
                className={classes.actionButtons}
                variant={action === 'query' ? 'contained' : 'outlined'}
                onClick={() => setAction('query')}
                color={action === 'query' ? 'primary' : 'default'}
                size='small'
              >
                Query
              </Button>
              <Button
                className={classes.actionButtons}
                variant={action === 'transact' ? 'contained' : 'outlined'}
                onClick={() => setAction('transact')}
                color={action === 'transact' ? 'primary' : 'default'}
                size='small'
              >
                Transact
              </Button>
            </ButtonGroup>
          )}
          <IconButton size='medium' color='primary' onClick={flureeHandler}>
            <PlayCircleFilledIcon fontSize='large' />
          </IconButton>
        </div>
      </div>
      <div className={classes.editorPane}>
        <div className={classes.history}>
          <History
            history={history}
            loadHistoryItem={setHistoryHandler}
            open={historyOpen}
          />
        </div>
        {/* <div> */}
        <div
          className={historyOpen ? classes.editorsSquished : classes.editors}
        >
          <SplitPane
            // className={classes.editors}
            split='vertical'
            minSize={300}
            defaultSize={size}
            resizerClassName={classes.split}
            onChange={(size) => {
              setSize(`${size}%`)
            }}
            style={{ width: 'inherit' }}
          >
            <div>
              <Editor
                action={action}
                title={action === 'query' ? 'Query' : 'Transact'}
                width='100%'
                name='flureeQL-editor'
                value={action === 'query' ? queryParam : txParam}
                onChange={(value) => {
                  if (action === 'query') setQueryParam(value)
                  else setTxParam(value)
                }}
              />
            </div>
            <div>
              <Editor
                title='Results'
                readOnly
                width='100%'
                name='flureeQL-results'
                value={results}
                stats={stats}
                action='results'
              />
            </div>
          </SplitPane>
        </div>
      </div>
    </div>
  )
}

export default FlureeQL
