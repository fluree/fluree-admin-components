// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState, FunctionComponent } from 'react'
import {
  Button,
  ButtonGroup,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Typography
} from '@material-ui/core'
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled'
import LockOutlinedIcon from '@material-ui/icons/LockOutlined' // import SplitPane from 'react-split-pane'
import AcUnitIcon from '@material-ui/icons/AcUnit'
import { Editor } from '../../Components/Editor'
import { History } from '../../Components/History'
import { SignQuery } from '../../Components/General/SignQuery'
import { GenKeysDialog } from './Dialogs/GenKeysDialog'
import { GenerateKeys } from '../../Components/GenerateKeys'
import { FlakeVisModal } from './Modals/FlakeVisModal'
import { BasicDialog } from '../../Components/General/BasicDialog'
import { makeStyles } from '@material-ui/core/styles'
import { flureeFetch } from '../../utils/flureeFetch'
import { useLocalHistory } from '../../utils/hooks'
import JSON5 from 'json5'
import { signQuery } from '@fluree/crypto-utils'
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
    '& > :not(:last-child)': {
      marginRight: theme.spacing(1)
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
    // maxHeight: 600,
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
  historyHeader: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2)
  },
  history: {
    maxHeight: 500,
    height: '100%',
    overflowX: 'scroll',
    [theme.breakpoints.down('sm')]: {
      maxHeight: 200
    }
  }
}))

interface Props {
  _db: DB
  allowTransact?: boolean
  withHistory?: boolean
  jsonMode?: 'json' | 'json5'
  token?: string
  allowKeyGen?: boolean
  allowSign?: boolean
}

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

export const FlureeQL: FunctionComponent<Props> = ({
  _db,
  allowTransact,
  withHistory = false,
  jsonMode = 'json',
  token = undefined,
  allowKeyGen = false,
  allowSign = false
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
  const [stats, setStats] = useState<Dictionary | undefined>(undefined)
  const [history, setHistory] = useLocalHistory(
    typeof _db.db === 'string'
      ? `${_db.db}_history`
      : `${_db.db['db/id']}_history`
  )
  const [historyOpen, setHistoryOpen] = useState(false)
  const [errorOpen, setErrorOpen] = useState(false)
  const [error, setError] = useState('')
  const [signOpen, setSignOpen] = useState(false)
  const [privateKey, setPrivateKey] = useState(_db.defaultPrivateKey || '')
  const [genOpen, setGenOpen] = useState(false)
  const [host, setHost] = useState(_db.ip)
  const [visOpen, setVisOpen] = useState(false)
  const [flakes, setFlakes] = useState<Array<any> | null>([
    [87960930223089, 50, 'vvvv', -39, true, null],
    [
      -39,
      99,
      '12aa480d22625afeee419550a7f8c9d9e3b5767bae265ca9409c2438c287456d',
      -39,
      true,
      null
    ],
    [
      -39,
      100,
      'c32d48220d2f6adcdd2b2c20a36738626428fb3fc325360a3ac525eacea99491',
      -39,
      true,
      null
    ],
    [-39, 101, 105553116266496, -39, true, null],
    [-39, 103, 1608068036088, -39, true, null],
    [
      -39,
      106,
      '{"type":"tx","db":"example/mdm","tx":[{"_id":"_user","username":"vvvv"}],"nonce":1608068036088,"auth":"TfKXH47U4W6UgnxeoPSXsrfEuAt5Lm97DGx","expire":1608068066090}',
      -39,
      true,
      null
    ],
    [
      -39,
      107,
      '1c30440220394ddc76ba35240763cfc46746f1d3deaef673e183b8d6043dd3ae6a8ad2911c02206ff7202615bb3fc6e86c53e2e934fcf77c8719a469ed2cdd9caa7d189cdded9c',
      -39,
      true,
      null
    ],
    [-39, 108, '{"_user$1":87960930223089}', -39, true, null]
  ])

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
    const remainingFuel = null
    return {
      fuel,
      block,
      time,
      status,
      remainingFuel
    }
  }

  const flureeHandler = async (sign = false) => {
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
    const { ip, db } = _db
    const dbName = typeof db === 'string' ? db : db['db/id']
    const fullDb = dbName.split('/')
    const queryParamStore =
      stringify(queryParam).length > 5000
        ? 'Values greater than 5k are not saved in the admin UI.'
        : queryParam
    const txParamStore =
      stringify(txParam).length > 5000
        ? 'Values greater than 5k are not saved in the admin UI.'
        : txParam
    localStorage.setItem(dbName.concat('_queryParam'), queryParamStore)
    localStorage.setItem(dbName.concat('_txParam'), txParamStore)
    localStorage.setItem(dbName.concat('_lastAction'), action)
    localStorage.setItem(
      dbName.concat('_lastType'),
      action === 'query' ? queryType : 'transact'
    )
    const opts = {
      ip,
      body: parsedParam,
      auth: token,
      network: fullDb[0],
      endpoint,
      db: fullDb[1],
      headers: sign
        ? signQuery(
            privateKey,
            JSON.stringify(parsedParam),
            endpoint,
            host,
            dbName
          ).headers
        : null
    }

    console.log({ opts })
    try {
      const results = await flureeFetch(opts)
      console.log({ results })
      if (results.status < 400) {
        setFlakes(null)
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
      if (results.data.flakes) {
        setFlakes(results.data.flakes)
      }
      setResults(stringify(results.data, null, 2))
      if (_db.environment === 'hosted') {
        setStats({
          Block:
            typeof results.data.block === 'object'
              ? results.data.block[0] === results.data.block[1]
                ? results.data.block[0]
                : results.data.block.join(' - ')
              : results.data.block,
          'Fuel Spent': results.data.fuel,
          Status: results.data.status,
          Time: results.data.time,
          'Remaining Fuel': results.data['fuel-remaining'] || null
        })
      } else {
        const resStats = getStats(results)
        setStats({
          'Fuel Spent': resStats.fuel,
          Block: resStats.block,
          Status: resStats.status,
          Time: resStats.time
        })
      }
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
          {allowKeyGen && (
            <Button
              color='primary'
              variant={genOpen ? 'contained' : 'outlined'}
              onClick={() => setGenOpen(true)}
            >
              Generate Keys
            </Button>
          )}
          {allowSign && (
            <Button
              color='primary'
              variant={signOpen ? 'contained' : 'outlined'}
              onClick={() => setSignOpen(!signOpen)}
            >
              Sign
            </Button>
          )}
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
          )}
          {action === 'query' && (
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
            </Select>
          )}
        </div>
        <div>
          <IconButton
            color='primary'
            onClick={() => setVisOpen(true)}
            disabled={!flakes}
          >
            <AcUnitIcon />
          </IconButton>
          {allowTransact && !signOpen && (
            <ButtonGroup disableElevation>
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
          <IconButton
            size='medium'
            color='primary'
            onClick={() => flureeHandler(signOpen)}
          >
            {signOpen && <LockOutlinedIcon fontSize='small' />}
            <PlayCircleFilledIcon fontSize='large' />
          </IconButton>
        </div>
      </div>
      <Grid container className={classes.grid}>
        <Grid item xs={12}>
          {signOpen && (
            <SignQuery
              hostValue={host}
              keyValue={privateKey}
              hostChange={(e) => setHost(e.target.value)}
              keyChange={(e) => setPrivateKey(e.target.value)}
            />
          )}
        </Grid>
        {historyOpen && (
          <Grid item xs={12} md={2}>
            <Typography variant='h4' className={classes.historyHeader}>
              History
            </Typography>
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
        <Grid item xs={12} md={historyOpen ? 10 : 12}>
          <Grid container>
            <Grid item xs={12} lg={6}>
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
            <Grid item xs={12} lg={6}>
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
          </Grid>
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
      <GenKeysDialog open={genOpen} onClose={() => setGenOpen(false)}>
        <GenerateKeys _db={_db} token={token} />{' '}
      </GenKeysDialog>
      <FlakeVisModal
        open={visOpen}
        onClose={() => setVisOpen(false)}
        flakes={flakes}
        _db={_db}
      />
    </div>
  )
}
