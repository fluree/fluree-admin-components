// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, FunctionComponent } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
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
import { generateKeyPair, getSinFromPublicKey } from '@fluree/crypto-utils'
// import { flureeFetch } from '../utils/flureeFetch'

const useStyles = makeStyles((theme) => ({
  root: { overFlowY: 'scroll' },
  closeButton: {
    position: 'absolute',
    top: 5,
    right: theme.spacing(1)
  },
  list: {},
  subheader: {
    fontWeight: 700
  },
  keyTable: {
    maxWidth: 'auto',
    width: '80%',
    justifyContent: 'center',
    margin: '0 auto',
    overflowX: 'hidden',
    overflowWrap: 'break-word',
    tableLayout: 'fixed'
  },
  key: {},
  value: {
    wordBreak: 'break-all',
    borderLeft: `solid 1px ${theme.palette.grey[300]}`
  },
  accentRow: {
    backgroundColor: theme.palette.grey[100]
  }
}))

interface Props {
  open: boolean
  onClose: () => void
  db: DB
}

export const GenerateKeys: FunctionComponent<Props> = ({ open, onClose }) => {
  const classes = useStyles()
  // const [auth, setAuth] = useState('')
  const [pubKey, setPubKey] = useState('')
  const [pvtKey, setPvtKey] = useState('')
  // const { publicKey, privateKey } = generateKeyPair()
  // const authId = getSinFromPublicKey(publicKey)
  const [authId, setAuthId] = useState('')
  // console.log({ authId, publicKey, privateKey })
  useEffect(() => {
    if (open) {
      const { publicKey, privateKey } = generateKeyPair()
      setPvtKey(privateKey)
      setPubKey(publicKey)
    }
  }, [open])

  // useEffect(() => {
  //   // if (pubKey.length) {
  //   const authId = getSinFromPublicKey(pubKey)
  //   setAuth(authId)
  //   // }
  // }, [pubKey])

  const [edValue, setEdValue] = useState('')

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

  // const transactHandler = () => {

  // }

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
      <DialogTitle id='generate-keys-title'>Generate Keys</DialogTitle>
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
              Please save your public and private keys . This is the only time
              you will be able to view them through the user interface.
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
          onChange={(value) => setEdValue(value)}
          width='100%'
        />
        <Editor
          height='150px'
          name='generate-keys-results'
          title='Results'
          readOnly
          width='100%'
        />
      </DialogContent>
    </Dialog>
  )
}
