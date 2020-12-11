// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, FunctionComponent } from 'react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  List,
  ListItem,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography
} from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import { Editor } from '../Editor'
import { BasicDialog } from '../General/BasicDialog'
import { generateKeyPair, getSinFromPublicKey } from '@fluree/crypto-utils'
import { convertArrayOfObjectsToCSV } from '../utils/convertToCsv'
import { VpnKey } from '@material-ui/icons'
import JSON5 from 'json5'
import { flureeFetch } from '../utils/flureeFetch'

const useStyles = makeStyles((theme) => ({
  root: { overFlowY: 'scroll' },
  closeButton: {
    position: 'absolute',
    top: 5,
    right: theme.spacing(1)
  },
  titleBar: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    '&>h2': {
      marginRight: theme.spacing(2)
    },
    borderBottom: `1px solid ${theme.palette.grey[300]}`
  },
  list: {},
  subheader: {
    fontWeight: 700
  },
  keyTable: {
    maxWidth: 'inherit',
    width: '80%',
    margin: '0 auto',
    overflowX: 'hidden',
    overflowWrap: 'break-word',
    tableLayout: 'fixed'
  },
  downloadLink: {
    fontWeight: 700,
    cursor: 'pointer'
  },
  key: {},
  value: {
    wordBreak: 'break-all',
    borderLeft: `solid 1px ${theme.palette.grey[300]}`
  },
  accentRow: {
    backgroundColor: theme.palette.grey[100]
  },
  fullWidthButton: {
    width: '100%'
  }
}))

interface Props {
  open: boolean
  onClose: () => void
  _db: DB
  token?: string
}

export const GenerateKeys: FunctionComponent<Props> = ({
  open,
  onClose,
  _db,
  token
}) => {
  const classes = useStyles()
  const [pubKey, setPubKey] = useState('')
  const [pvtKey, setPvtKey] = useState('')
  const [authId, setAuthId] = useState('')
  const [error, setError] = useState('')
  const [errorOpen, setErrorOpen] = useState(false)
  useEffect(() => {
    if (open) {
      const { publicKey, privateKey } = generateKeyPair()
      setPvtKey(privateKey)
      setPubKey(publicKey)
    }
  }, [open])

  const [edValue, setEdValue] = useState('')
  const [resEdValue, setResEdValue] = useState('')

  useEffect(() => {
    if (pubKey) {
      const newAuthId = getSinFromPublicKey(pubKey)
      setAuthId(newAuthId)
    }
  }, [pubKey])

  useEffect(() => {
    setEdValue(
      `[\n  {\n    "_id": "_auth",\n    "id": "${authId}",\n    "roles": [\n      [\n        "_role/id",\n        "root"\n      ]\n    ]\n  }\n]`
    )
  }, [authId])

  const downloadHandler = () => {
    const data = [
      {
        'Public Key': pubKey,
        'Private Key': pvtKey,
        'Auth Id': authId
      }
    ]
    const csv = convertArrayOfObjectsToCSV({ data: data })
    if (csv === null) return

    var hiddenElement = document.createElement('a')
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + csv
    hiddenElement.target = '_blank'
    hiddenElement.download = 'keys.csv'
    hiddenElement.click()
  }

  const transactHandler = async () => {
    const param = edValue
    const endpoint = 'transact'
    let parsedParam: object
    try {
      parsedParam = JSON5.parse(param)
    } catch (err) {
      setError(err.message)
      setErrorOpen(true)
      return
    }
    const { ip, db } = _db
    const dbName = typeof db === 'string' ? db : db['db/id']
    const fullDb = dbName.split('/')
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
      setResEdValue(JSON5.stringify(results.data, null, 2))
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <Dialog
      fullWidth
      className={classes.root}
      onClose={onClose}
      open={open}
      aria-labelledby='generate-keys-title'
      aria-describedby='generate-keys-body'
    >
      <IconButton className={classes.closeButton} onClick={onClose}>
        <CloseIcon />
      </IconButton>
      <DialogTitle
        disableTypography
        className={classes.titleBar}
        id='generate-keys-title'
      >
        <Typography component='h2' variant='h6'>
          Generate Keys
        </Typography>
        <VpnKey fontSize='large' />
        <VpnKey fontSize='large' />
      </DialogTitle>
      <DialogContent id='generate-keys-body'>
        <Typography
          className={classes.subheader}
          component='h4'
          variant='subtitle1'
        >
          Managing Your Public and Private Keys
        </Typography>
        <List>
          <ListItem>
            <Typography variant='body2'>
              Please{' '}
              <Link className={classes.downloadLink} onClick={downloadHandler}>
                save your public and private keys
              </Link>
              . This is the only time you will be able to view them through the
              user interface.
            </Typography>
          </ListItem>
          <ListItem>
            <Typography variant='body2'>
              In order to connect your key pair to an auth record, please submit
              the below transaction. By default, the below transaction will
              connect the new auth record to the root role, but this can be
              modified.
            </Typography>
          </ListItem>
        </List>
        <TableContainer component={Paper} classes={{ root: classes.keyTable }}>
          <Table>
            <TableBody>
              <TableRow className={classes.accentRow}>
                <TableCell variant='head' className={classes.key}>
                  Public Key
                </TableCell>
                <TableCell className={classes.value}>{pubKey}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell variant='head' className={classes.key}>
                  Private Key
                </TableCell>
                <TableCell className={classes.value}>{pvtKey}</TableCell>
              </TableRow>
              <TableRow className={classes.accentRow}>
                <TableCell variant='head' className={classes.key}>
                  Auth ID
                </TableCell>
                <TableCell className={classes.value}>{authId}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <Editor
          height='150px'
          name='generate-keys-transaction'
          title='Transaction'
          value={edValue}
          onChange={(value) => {
            if (value) setEdValue(value)
          }}
          width='100%'
        />
        <Button
          variant='contained'
          color='primary'
          className={classes.fullWidthButton}
          onClick={transactHandler}
        >
          Transact
        </Button>
        <Editor
          height='150px'
          name='generate-keys-results'
          title='Results'
          readOnly
          width='100%'
          value={resEdValue}
        />
      </DialogContent>
      <BasicDialog
        open={errorOpen}
        message={error}
        onClose={() => setErrorOpen(false)}
      />
    </Dialog>
  )
}
