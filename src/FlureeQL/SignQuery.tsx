// eslint-disable-next-line no-unused-vars
import React, { FunctionComponent } from 'react'
import { TextField } from '@material-ui/core'

interface SignQueryProps {
  keyValue: string
  hostValue: string
  keyChange: (event: any) => void
  hostChange: (event: any) => void
}

export const SignQuery: FunctionComponent<SignQueryProps> = ({
  keyValue,
  hostValue,
  keyChange,
  hostChange
}) => {
  return (
    <div>
      <TextField
        label='Sign'
        variant='outlined'
        value={keyValue}
        onChange={keyChange}
      />
      <TextField
        label='Host'
        variant='outlined'
        value={hostValue}
        onChange={hostChange}
      />
    </div>
  )
}
