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
  MenuItem
} from '@material-ui/core'
import CasinoIcon from '@material-ui/icons/Casino'
import RestoreIcon from '@material-ui/icons/Restore'
import { flureeFetch, splitDb } from '../../utils/flureeFetch'

interface Props {
  formValue: SignedTransactionForm
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  rollNonce?: () => void
  refreshExpire?: () => void
  _db: DB
}

interface AuthShape {
  id: string
  _id: number
}

const useStyles = makeStyles((theme) => ({
  root: {
    '&>div': {
      marginRight: theme.spacing(1)
    }
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
}) => {
  const classes = useStyles()
  const [authOptions, setAuthOptions] = useState<Array<object>>([])

  const fetchAuth = async (_db: DB) => {
    try {
      const { ip, db, openApi, token } = _db
      const dbSplit = splitDb(db)[1]
      const authQuery = { select: ['*'], from: '_auth' }
      if (openApi) {
        const opts: FetchOptions = {
          ip,
          endpoint: 'query',
          network: dbSplit[0],
          db: dbSplit[1],
          body: authQuery,
          auth: token
        }
        const results = await flureeFetch(opts)

        console.log(results)
        return results.data
      }
    } catch (err) {
      console.log(err)
      // eslint-disable-next-line no-debugger
      debugger
    }
  }

  console.log(authOptions)

  useEffect(() => {
    let mounted = true
    fetchAuth(_db).then((data) => {
      if (mounted) {
        setAuthOptions(
          data.map((auth: any) => ({
            id: auth['_auth/id'],
            _id: auth._id
          }))
        )
      }
    })

    return function cleanup() {
      mounted = false
    }
  }, [_db])

  return (
    <form className={classes.root}>
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
      <FormControl color='primary' margin='dense' variant='outlined'>
        <TextField
          onChange={onChange}
          value={formValue.maxFuel}
          name='maxFuel'
          variant='outlined'
          label='Max Fuel'
        />
      </FormControl>
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
      <FormControl
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
          children={
            authOptions.length &&
            authOptions.map((option: AuthShape) => (
              <MenuItem value={option._id} key={option._id}>
                {option.id}
              </MenuItem>
            ))
          }
        />
      </FormControl>
      <FormControl variant='outlined' color='primary' margin='dense'>
        <TextField
          variant='outlined'
          value={formValue.privateKey}
          onChange={onChange}
          label='Private Key'
          name='privateKey'
        />
      </FormControl>
    </form>
  )
}
