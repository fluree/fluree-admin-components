// eslint-disable-next-line no-unused-vars
import React, { FunctionComponent } from 'react'
import { TextField, makeStyles } from '@material-ui/core'

interface SignQueryProps {
  keyValue: string
  hostValue: string
  keyChange: (event: any) => void
  hostChange: (event: any) => void
}

const useStyles = makeStyles((theme) => ({
  root: {
    '& > :not(:last-child)': {
      marginRight: theme.spacing(1)
    }
  }
}))

export const SignQuery: FunctionComponent<SignQueryProps> = ({
  keyValue,
  hostValue,
  keyChange,
  hostChange
}) => {
  const classes = useStyles()
  return (
    <div className={classes.root}>
      <TextField
        label='Sign'
        variant='outlined'
        value={keyValue}
        onChange={keyChange}
        margin='dense'
      />
      <TextField
        label='Host'
        variant='outlined'
        value={hostValue}
        onChange={hostChange}
        margin='dense'
      />
    </div>
  )
}
