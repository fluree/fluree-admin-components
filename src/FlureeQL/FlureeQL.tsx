// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState, FunctionComponent } from 'react'
import {
  Button,
  ButtonGroup,
  Grid,
  IconButton,
  // FormControl,
  // InputLabel,
  MenuItem,
  Paper,
  Select
} from '@material-ui/core'
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled'
// import SplitPane from 'react-split-pane'
import { Editor } from '../Editor'
import { History } from '../History'
import BasicDialog from '../General/BasicDialog'
import { makeStyles } from '@material-ui/core/styles'
import { flureeFetch } from '../utils/flureeFetch'
import { useLocal } from '../utils/hooks'
import JSON5 from 'json5'
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
  grid: {
    padding: theme.spacing(2)
  },
  editorPane: {
    display: 'flex',
    marginLeft: '1%',
    alignItems: 'stretch',
    maxHeight: 600,
    height: '100%'
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
    maxHeight: 'inherit',
    height: 'inherit',
    position: 'static'
  },
  history: {
    maxHeight: 560,
    overflowX: 'scroll',
    [theme.breakpoints.down('sm')]: {
      maxHeight: 200
    }
  }
}))

interface DB {
  account?: string
  db: string
  dbs?: Array<string>
  defaultPrivateKey?: any
  displayError?: string
  environment?: string
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
  withHistory?: boolean
  jsonMode?: 'json' | 'json5'
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

const FlureeQL: FunctionComponent<Props> = ({
  _db,
  allowTransact,
  withHistory = false,
  jsonMode = 'json'
}) => {
  const classes = useStyles()
  const [action, setAction] = useState('query')
  // const [size, setSize] = useState('50%')
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
  const [history, setHistory] = useLocal(`${_db.db}_history`)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [errorOpen, setErrorOpen] = useState(false)
  const [error, setError] = useState('')

  const parse = jsonMode === 'json' ? JSON.parse : JSON5.parse
  const stringify = jsonMode === 'json' ? JSON.stringify : JSON5.stringify

  // console.log({ stats })
  useEffect(() => {
    setQueryParam(queryTypes[queryType][1])
  }, [queryType])

  const setHistoryHandler = (
    action: string,
    param: object,
    type?: string | null
  ) => {
    setAction(action)
    if (action === 'transact') {
      setTxParam(stringify(param))
    } else {
      type && setQueryType(type)
      setQueryParam(stringify(param))
    }
  }

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
    let parsedParam: object
    try {
      parsedParam = parse(param)
    } catch (err) {
      setError(err.message)
      setErrorOpen(true)
      return
    }
    const { ip, db, token } = _db
    const fullDb = db.split('/')
    const queryParamStore =
      stringify(queryParam).length > 5000
        ? 'Values greater than 5k are not saved in the admin UI.'
        : queryParam
    const txParamStore =
      stringify(txParam).length > 5000
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
        if (history.length && history.length > 0) {
          const latest = stringify({
            action,
            param: parsedParam,
            type: queryType
          })
          if (stringify(history[0]) !== latest) {
            setHistory([
              { action: action, param: parsedParam, type: queryType },
              ...history
            ])
          }
        } else
          setHistory([
            { action: action, param: parsedParam, type: queryType },
            ...history
          ])
      }
      setResults(stringify(results.data, null, 2))
      setStats(getStats(results))
    } catch (err) {
      console.log(err)
    }
    // const formattedResults = stringify(response.json)
    // setResults(formattedResults)
    // setResults(stringify(parse(response.json)))
  }

  return (
    <div className={classes.root}>
      <div className={classes.toolbar}>
        <div className={classes.queryActions}>
          {/* <Button color='primary' variant='outlined'>
            Generate Keys
          </Button>
          <Button color='primary' variant='outlined'>
            Sign
          </Button> */}
          {withHistory && (
            <Button
              color='primary'
              variant={historyOpen ? 'contained' : 'outlined'}
              onClick={() => {
                setHistoryOpen(!historyOpen)
              }}
            >
              History
            </Button>
          )}{' '}
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
          {allowTransact && (
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
      <Grid container spacing={2} className={classes.grid}>
        {historyOpen && (
          <Grid item xs={12} md={2}>
            <Paper className={classes.history}>
              <History history={history} loadHistoryItem={setHistoryHandler} />
            </Paper>
          </Grid>
        )}
        {/* <div> */}
        {/* <SplitPane
            className={classes.editors}
            split='vertical'
            minSize={300}
            defaultSize={size}
            resizerClassName={classes.split}
            onChange={(size) => {
              setSize(`${size}%`)
            }}
            style={{ width: 'inherit' }}
          > */}
        <Grid item xs={12} md={historyOpen ? 5 : 6}>
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
            mode={jsonMode}
          />
        </Grid>
        <Grid item xs={12} md={historyOpen ? 5 : 6}>
          <Editor
            title='Results'
            readOnly
            width='100%'
            name='flureeQL-results'
            value={results}
            stats={stats}
            action='results'
            mode={jsonMode}
          />
        </Grid>
        {/* </SplitPane> */}
      </Grid>
      <BasicDialog
        message={error}
        open={errorOpen}
        onClose={() => {
          setErrorOpen(false)
          setError('')
        }}
      />
    </div>
  )
}

export default FlureeQL
