// eslint-disable-next-line no-unused-vars
import React, { FunctionComponent } from 'react'
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Button
} from '@material-ui/core'

interface DialogProps {
  open: boolean
  onClose: () => void
  message: string
}

export const BasicDialog: FunctionComponent<DialogProps> = ({
  open,
  onClose,
  message
}) => {
  return (
    <Dialog open={open} onClose={onClose} aria-describedby='dialog-message'>
      <DialogContent>
        <DialogContentText id='dialog-message'>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button color='primary' onClick={onClose}>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  )
}
