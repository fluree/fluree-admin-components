// eslint-disable-next-line no-unused-vars
import React, { FunctionComponent } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  makeStyles
} from '@material-ui/core'
import { VpnKey } from '@material-ui/icons'
import CloseIcon from '@material-ui/icons/Close'

// import { GenerateKeys } from '../../../Components/GenerateKeys'

interface Props {
  open: boolean
  onClose: () => void
  // _db: DB
  // token?: string
}

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
  }
}))

export const GenKeysDialog: FunctionComponent<Props> = ({
  open,
  onClose,
  // _db,
  // token,
  children
}) => {
  const classes = useStyles()
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
      <DialogContent id='generate-keys-body'>{children}</DialogContent>
    </Dialog>
  )
}
