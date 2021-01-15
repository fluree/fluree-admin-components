// eslint-disable-next-line no-unused-vars
import React, { FunctionComponent } from 'react'
import { Grid, TextField } from '@material-ui/core'

export const SignQuery: FunctionComponent<SignQueryProps> = ({
  keyValue,
  hostValue,
  keyChange,
  hostChange
}) => {
  return (
    <Grid container spacing={1}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label='Private Key'
          variant='outlined'
          value={keyValue}
          onChange={keyChange}
          name='privateKey'
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label='Host'
          variant='outlined'
          value={hostValue}
          onChange={hostChange}
        />
      </Grid>
    </Grid>
  )
}
