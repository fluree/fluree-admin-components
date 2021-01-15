import React, {
  useEffect,
  useState,
  // eslint-disable-next-line no-unused-vars
  FunctionComponent
} from 'react'
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
import { Editor } from '../../Components/Editor'
import { History } from '../../Components/History'
import { SignQuery } from '../../Components/Forms/Sign/SignQuery'
import { SignTransaction } from '../../Components/Forms/Sign/SignTransaction'
import { GenKeysDialog } from './Dialogs/GenKeysDialog'
import { GenerateKeys } from '../../Components/GenerateKeys'
import { BasicDialog } from '../../Components/General/BasicDialog'
import { makeStyles } from '@material-ui/core/styles'
import { splitDb } from '../../utils/flureeFetch'
import { useLocalHistory, useFql, useSavedState } from '../../utils/hooks'
import useSignForm from '../../Components/Forms/Sign/hooks'
import JSON5 from 'json5'
import YAML from 'yaml'

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
  signQueryForm: {
    marginTop: theme.spacing(1)
  },
  grid: {},
  editorPane: {
    display: 'flex',
    marginLeft: '1%',
    alignItems: 'stretch',
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
    marginBottom: theme.spacing(2.5)
  },
  history: {
    maxHeight: 200,
    height: '100%',
    overflowX: 'scroll',
    [theme.breakpoints.up('md')]: {
      maxHeight: 1090
    },
    [theme.breakpoints.up('lg')]: {
      maxHeight: 500
    }
  }
}))

const queryTypes: QueryTypes = {
  Query: ['query', { select: ['*'], from: '_collection' }],
  Block: ['block', { block: 1 }],
  'Multi-Query': [
    'multi-query',
    {
      collections: { select: ['*'], from: '_collection' },
      users: { select: ['*'], from: '_user' }
    }
  ],
  History: ['history', { history: [] }]
}

export const FlureeQL: FunctionComponent<FQLProps> = ({
  _db,
  allowTransact,
  withHistory = false,
  editorMode = 'json',
  token = undefined,
  allowKeyGen = false,
  allowSign = false
}) => {
  const classes = useStyles()
  const parse = { json: JSON.parse, json5: JSON5.parse, yaml: YAML.parse }[
    editorMode
  ]
  const stringify = {
    json: JSON.stringify,
    json5: JSON5.stringify,
    yaml: (value: object | string, ..._rest: any) => YAML.stringify(value)
  }[editorMode]

  // state variable for toggling between 'query' and 'transact'
  const [action, setAction] = useSavedState(
    splitDb(_db.db)[0].concat('_lastAction'),
    'query'
  )
  // special query endpoint
  const [queryType, setQueryType] = useSavedState(
    splitDb(_db.db)[0].concat('_savedQueryType'),
    'Query'
  )
  const [queryParam, setQueryParam] = useSavedState(
    splitDb(_db.db)[0].concat('_savedQuery'),
    stringify(queryTypes.Query[1], null, 2)
  )
  const [txParam, setTxParam] = useSavedState(
    splitDb(_db.db)[0].concat('_savedTx'),
    stringify([{ _id: '_user', username: 'newUser' }], null, 2)
  )
  const [history, setHistory] = useLocalHistory(
    typeof _db.db === 'string'
      ? `${_db.db}_history`
      : `${_db.db['db/id']}_history`
  )
  const [historyOpen, setHistoryOpen] = useSavedState(
    splitDb(_db.db)[0].concat('_histOpen'),
    false
  )
  const [errorOpen, setErrorOpen] = useState(false)
  const [error, setError] = useState('')
  const [signOpen, setSignOpen] = useSavedState(
    splitDb(_db.db)[0].concat('_signOpen'),
    false
  )
  const [genOpen, setGenOpen] = useState(false)
  const [host, setHost] = useState(_db.ip)
  const {
    results,
    metadata,
    sendUnsigned,
    sendSignedQuery,
    sendSignedTx,
    requestError,
    reqErrorOpen,
    setReqErrorOpen
  } = useFql('// Results will appear here!')

  const {
    signForm,
    rollNonce,
    refreshExpire,
    signFormHandler,
    clearTxFormAuth
  } = useSignForm(_db.defaultPrivateKey || '')
  // handles writing last successful request to history
  useEffect(() => {
    if (results.status) {
      if (results.status && results.status < 400) {
        const latest = stringify({
          action,
          param: action === 'query' ? parse(queryParam) : parse(txParam),
          type: action === 'query' ? queryType : null
        })
        console.log({ latest })
        if (history.length && history.length > 0) {
          if (stringify(history[0]) !== latest) {
            setHistory([parse(latest), ...history])
          }
        } else setHistory([parse(latest), ...history])
      }
    }
  }, [results])

  // handles action, query type (if applicable), and query/tx
  // param value change when clicking on history list item
  const setHistoryHandler = (
    action: string,
    param: object,
    type?: QueryType
  ) => {
    setAction(action)
    if (action === 'transact') {
      setTxParam(stringify(param, null, 2))
    } else {
      type && setQueryType(type)
      setQueryParam(stringify(param, null, 2))
    }
  }

  const queryTypeChange = (e: any) => {
    console.log(e.target.value)
    setQueryType(e.target.value)
    const formattedString = stringify(queryTypes[e.target.value][1], null, 2)
    setQueryParam(formattedString)
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

    console.log({ opts })
    // time to send the request
    try {
      if (sign) {
        if (action === 'transact' && signForm.auth) {
          sendSignedTx(opts, {
            authId: signForm.auth,
            dbName,
            expire: signForm.expire,
            maxFuel: signForm.maxFuel,
            nonce: signForm.nonce,
            privateKey: signForm.privateKey
          })
        } else
          sendSignedQuery(opts, { dbName, privateKey: signForm.privateKey })
        return
      }
      sendUnsigned(opts)
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
              onChange={queryTypeChange}
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
      <Grid container spacing={1} className={classes.grid}>
        <Grid item xs={12}>
          {signOpen &&
            (action === 'query' ? (
              <div className={classes.signQueryForm}>
                <SignQuery
                  hostValue={host}
                  keyValue={signForm.privateKey}
                  hostChange={(e) => setHost(e.target.value)}
                  keyChange={signFormHandler}
                />
              </div>
            ) : (
              <SignTransaction
                formValue={signForm}
                onChange={signFormHandler}
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
        <Grid item xs={12} md={historyOpen ? 10 : 12}>
          <Grid spacing={3} container>
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
                value={results.dataString}
                stats={metadata}
                action='results'
                mode={editorMode}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <BasicDialog
        message={requestError}
        open={reqErrorOpen}
        onClose={() => {
          setReqErrorOpen(false)
        }}
      />
      <BasicDialog
        message={error}
        open={errorOpen}
        onClose={() => {
          setErrorOpen(false)
        }}
      />

      <GenKeysDialog open={genOpen} onClose={() => setGenOpen(false)}>
        <GenerateKeys _db={_db} token={token} />{' '}
      </GenKeysDialog>
    </div>
  )
}
