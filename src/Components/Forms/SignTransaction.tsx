import React, {
  // eslint-disable-next-line no-unused-vars
  ChangeEvent,
  // eslint-disable-next-line no-unused-vars
  FunctionComponent,
  useState,
  useEffect
} from 'react'
import {
  FormControl,
  TextField,
  IconButton,
  makeStyles,
  // InputLabel,
  // Select,
  MenuItem,
  Grid
} from '@material-ui/core'
import CasinoIcon from '@material-ui/icons/Casino'
import RestoreIcon from '@material-ui/icons/Restore'
import {
  // flureeFetch,
  splitDb
} from '../../utils/flureeFetch'
import { useFql } from '../../utils/hooks'
// import { signQuery } from '@fluree/crypto-utils'

interface Props {
  formValue: SignedTransactionForm
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  rollNonce?: () => void
  refreshExpire?: () => void
  clearAuth?: () => void
  _db: DB
}

interface AuthShape {
  id: string
  _id: number
}

const useStyles = makeStyles(() => ({
  root: {
    // '&>div': {
    //   marginRight: theme.spacing(1)
    // }
  },
  selectRoot: {
    marginTop: 8,
    minWidth: 200
  }
}))

export const SignTransaction: FunctionComponent<Props> = ({
  formValue,
  onChange,
  rollNonce,
  refreshExpire,
  _db
  // clearAuth
}) => {
  const classes = useStyles()
  // const hosted = process.env.REACT_APP_ENVIRONMENT === 'hosted'
  const [authOptions, setAuthOptions] = useState<Array<AuthShape> | null>(null)
  const { results, sendUnsigned } = useFql()

  const fetchAuth = async (_db: DB) => {
    try {
      const { ip, db } = _db
      const token = _db.token || localStorage.getItem('token') || undefined
      const dbSplit = splitDb(db)[1]
      const authQuery = { select: ['*'], from: '_auth' }
      const opts: FetchOptions = {
        ip,
        endpoint: 'query',
        network: dbSplit[0],
        db: dbSplit[1],
        body: authQuery,
        auth: token
      }
      // if (openApi) {
      //   opts = {
      //     ip,
      //     endpoint: 'query',
      //     network: dbSplit[0],
      //     db: dbSplit[1],
      //     body: authQuery,
      //     auth: token
      //   }
      // } else {
      //   opts = {
      //     ip,
      //     endpoint: 'query',
      //     network: dbSplit[0],
      //     db: dbSplit[1],
      //     body: authQuery,
      //     auth: token,
      //     headers: signQuery()
      //   }
      // }
      console.log({ opts })
      sendUnsigned(opts)

      // const results = await flureeFetch(opts)

      // console.log(results)
      // if (hosted) {
      //   return results.data.result
      // }
      // return results.data
    } catch (err) {
      console.log(err)
      // eslint-disable-next-line no-debugger
      debugger
    }
  }

  console.log(authOptions)

  useEffect(() => {
    fetchAuth(_db)
    // if (mounted && results.data.length) {
    //   setAuthOptions(
    //     [results.data].map((auth: Record<string, unknown>) => ({
    //       id: auth['_auth/id'],
    //       _id: auth._id
    //     }))
    //   )
    // }
  }, [])
  useEffect(() => {
    // let mounted = true
    // if (mounted) {
    console.log({ results })
    if (results.data && Array.isArray(results.data)) {
      const options: Array<AuthShape> = results.data.map((auth: any) => ({
        id: auth['_auth/id'],
        _id: auth._id
      }))
      setAuthOptions(options)
    }
    // }
    // return function cleanup() {
    //   clearAuth && clearAuth()
    //   mounted = false
    // }
  }, [results.data])

  return (
    <form className={classes.root}>
      <Grid container spacing={1}>
        <Grid item xs={12} sm={6}>
          <FormControl
            variant='outlined'
            fullWidth
            color='primary'
            margin='dense'
          >
            <TextField
              variant='outlined'
              value={formValue.privateKey}
              onChange={onChange}
              label='Private Key'
              name='privateKey'
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl
            fullWidth
            color='primary'
            variant='outlined'
            classes={{ root: classes.selectRoot }}
          >
            {/* <InputLabel id='auth-label'>Auth</InputLabel> */}
            <TextField
              variant='outlined'
              color='primary'
              select
              id='auth-select'
              value={formValue.auth}
              onChange={onChange}
              label='Auth'
              name='auth'
              // children={
              //   authOptions &&
              //   authOptions.map((option: AuthShape) => (
              //     <MenuItem value={option.id} key={option._id}>
              //       {option.id}
              //     </MenuItem>
              //   ))
              // }
            >
              {authOptions &&
                authOptions.map((option: AuthShape) => (
                  <MenuItem value={option.id} key={option._id}>
                    {option.id}
                  </MenuItem>
                ))}
            </TextField>
          </FormControl>
        </Grid>
        <Grid item xs={6} sm={2}>
          <FormControl color='primary' margin='dense' variant='outlined'>
            <TextField
              onChange={onChange}
              value={formValue.expire}
              name='expire'
              variant='outlined'
              label='Expires'
              InputProps={{
                endAdornment: refreshExpire && (
                  <IconButton edge='end' onClick={refreshExpire}>
                    <RestoreIcon />
                  </IconButton>
                )
              }}
            />
          </FormControl>
        </Grid>
        <Grid item xs={6} sm={2}>
          <FormControl
            fullWidth
            color='primary'
            margin='dense'
            variant='outlined'
          >
            <TextField
              onChange={onChange}
              value={formValue.maxFuel}
              name='maxFuel'
              variant='outlined'
              label='Max Fuel'
            />
          </FormControl>
        </Grid>
        <Grid item xs={6} sm={2}>
          <FormControl color='primary' margin='dense' variant='outlined'>
            <TextField
              onChange={onChange}
              value={formValue.nonce}
              name='nonce'
              variant='outlined'
              label='Nonce'
              InputProps={
                rollNonce && {
                  endAdornment: (
                    <IconButton edge='end' onClick={rollNonce}>
                      <CasinoIcon />
                    </IconButton>
                  )
                }
              }
            />
          </FormControl>
        </Grid>
      </Grid>
    </form>
  )
}
