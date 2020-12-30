import React, {
  useEffect,
  useState,
  // eslint-disable-next-line no-unused-vars
  FunctionComponent,
  // eslint-disable-next-line no-unused-vars
  ChangeEvent
} from 'react'
import {
  Button,
  ButtonGroup,
  Grid,
  IconButton,
  // FormControl,
  // InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography
} from '@material-ui/core'
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled'
import LockOutlinedIcon from '@material-ui/icons/LockOutlined' // import SplitPane from 'react-split-pane'
import { Editor } from '../../Components/Editor'
import { History } from '../../Components/History'
import { SignQuery } from '../../Components/Forms/SignQuery'
import { SignTransaction } from '../../Components/Forms/SignTransaction'
import { GenKeysDialog } from './Dialogs/GenKeysDialog'
import { GenerateKeys } from '../../Components/GenerateKeys'
import { BasicDialog } from '../../Components/General/BasicDialog'
import { makeStyles } from '@material-ui/core/styles'
import { flureeFetch, splitDb } from '../../utils/flureeFetch'
import { useLocalHistory } from '../../utils/hooks'
import JSON5 from 'json5'
import YAML from 'yaml'
import { signQuery, signTransaction } from '@fluree/crypto-utils'
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
    // padding: theme.spacing(2)
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
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  history: {
    maxHeight: 200,
    height: '100%',
    overflowX: 'scroll',
    [theme.breakpoints.up('md')]: {
      maxHeight: 1090
    },
    // [theme.breakpoints.down('sm')]: {
    //   maxHeight: 200
    // },
    [theme.breakpoints.up('lg')]: {
      maxHeight: 500
    }
  }
}))

interface Props {
  _db: DB
  allowTransact?: boolean
  withHistory?: boolean
  editorMode?: 'json' | 'json5' | 'yaml'
  token?: string
  allowKeyGen?: boolean
  allowSign?: boolean
}

type QueryType = 'Query' | 'Block' | 'Multi-Query' | 'History'
interface QueryTypes {
  Query: [string, string]
  Block: [string, string]
  'Multi-Query': [string, string]
  History: [string, string]
}

const queryTypes: QueryTypes = {
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
  editorMode = 'json',
  token = undefined,
  allowKeyGen = false,
  allowSign = false
}) => {
  const classes = useStyles()

  // state variable for toggling between 'query' and 'transact'
  const [action, setAction] = useState('query')
  // special query endpoint
  const [queryType, setQueryType] = useState<QueryType>('Query')
  const [queryParam, setQueryParam] = useState('')
  const [txParam, setTxParam] = useState(
    '[{"_id":"_user","username":"newUser"}]'
  )
  const [results, setResults] = useState('')
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

  const [signTxForm, setSignTxForm] = useState<SignedTransactionForm>({
    expire: `${Date.now() + 180000}`,
    maxFuel: '1000000',
    nonce: `${Math.ceil(Math.random() * 100)}`,
    privateKey: '',
    auth: ''
  })

  // const [loading, setLoading] = useState(false)
  // const [size, setSize] = useState('50%')
  const rollNonce = () => {
    setSignTxForm({ ...signTxForm, nonce: `${Math.ceil(Math.random() * 100)}` })
  }

  const refreshExpire = () => {
    setSignTxForm({ ...signTxForm, expire: `${Date.now() + 180000}` })
  }

  const signTxFormHandler = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setSignTxForm({ ...signTxForm, [event.target.name]: event.target.value })
  }

  const clearTxFormAuth = () => {
    setSignTxForm({ ...signTxForm, auth: '' })
  }

  const parse = { json: JSON.parse, json5: JSON5.parse, yaml: YAML.parse }[
    editorMode
  ]
  const stringify = {
    json: JSON.stringify,
    json5: JSON5.stringify,
    yaml: (value: object | string, ..._rest: any) => YAML.stringify(value)
  }[editorMode]

  useEffect(() => {
    setQueryParam(queryTypes[queryType][1])
  }, [queryType])

  const setHistoryHandler = (
    action: string,
    param: object,
    type?: QueryType
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

  const flureeHandler = async (sign: boolean) => {
    const { ip, db } = _db
    const [dbName, fullDb] = splitDb(db)
    let opts: FetchOptions
    try {
      opts = {
        ip,
        body: action === 'query' ? parse(queryParam) : parse(txParam),
        auth: token,
        network: fullDb[0],
        endpoint:
          action === 'query'
            ? queryTypes[queryType][0]
            : sign
            ? 'command'
            : 'transact',
        db: fullDb[1]
      }
    } catch (err) {
      setError(err.message)
      setErrorOpen(true)
      return
    }
    const parsedParam = opts.body
    if (sign) {
      if (action === 'transact') {
        try {
          const signed = signTransaction(
            signTxForm.auth,
            dbName,
            signTxForm.expire,
            signTxForm.maxFuel,
            signTxForm.nonce,
            signTxForm.privateKey,
            JSON.stringify(parsedParam)
          )
          console.log({ signed })
          opts.body = signed
          // eslint-disable-next-line no-debugger
          debugger
        } catch (err) {
          // eslint-disable-next-line no-debugger
          debugger
          console.log(err)
        }
      } else {
        opts.headers = signQuery(
          privateKey,
          JSON.stringify(parsedParam),
          opts.endpoint,
          host,
          dbName
        ).headers
      }
    }
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

    console.log({ opts })
    try {
      const results = await flureeFetch(opts)
      console.log({ results })
      if (results.status < 400) {
        if (history.length && history.length > 0) {
          const latest = stringify({
            action,
            param: parsedParam,
            type: action === 'query' ? queryType : null
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
              disableElevation
            >
              Generate Keys
            </Button>
          )}
          {allowSign && (
            <Button
              color='primary'
              variant={signOpen ? 'contained' : 'outlined'}
              onClick={() => setSignOpen(!signOpen)}
              disableElevation
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
              disableElevation
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
          {allowTransact && (
            <ButtonGroup disableElevation>
              <Button
                className={classes.actionButtons}
                variant={action === 'query' ? 'contained' : 'outlined'}
                onClick={() => setAction('query')}
                color='primary'
                size='small'
              >
                Query
              </Button>
              <Button
                className={classes.actionButtons}
                variant={action === 'transact' ? 'contained' : 'outlined'}
                onClick={() => setAction('transact')}
                color='primary'
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
          {signOpen &&
            (action === 'query' ? (
              <SignQuery
                hostValue={host}
                keyValue={privateKey}
                hostChange={(e) => setHost(e.target.value)}
                keyChange={(e) => setPrivateKey(e.target.value)}
              />
            ) : (
              <SignTransaction
                formValue={signTxForm}
                onChange={signTxFormHandler}
                rollNonce={rollNonce}
                refreshExpire={refreshExpire}
                clearAuth={clearTxFormAuth}
                _db={_db}
              />
            ))}
        </Grid>
        {historyOpen && (
          <Grid item xs={12} md={2}>
            <Typography variant='h4' className={classes.historyHeader}>
              History
            </Typography>
            <Paper className={classes.history} elevation={0}>
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
                mode={editorMode}
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
                mode={editorMode}
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
    </div>
  )
}
