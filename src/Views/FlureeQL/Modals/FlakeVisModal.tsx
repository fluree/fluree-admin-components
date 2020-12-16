// eslint-disable-next-line no-unused-vars
import React, { FunctionComponent } from 'react'
import { Modal, Typography, makeStyles } from '@material-ui/core'
import { GraphView } from '../../../Components/GraphView'

interface Props {
  flakes: Array<any> | null
  _db: DB
  open: boolean
  onClose: () => void
}

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 1200,
    width: '100%',
    background: 'white',
    margin: '0 auto',
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  header: { textAlign: 'center' }
}))

export const FlakeVisModal: FunctionComponent<Props> = ({
  open,
  onClose,
  flakes,
  _db
}) => {
  const classes = useStyles()
  const body = (
    <div className={classes.root}>
      <Typography variant='h2' id='flake-view-title' className={classes.header}>
        Flake View
      </Typography>
      <GraphView flakes={flakes} _db={_db} />
    </div>
  )

  return (
    <Modal aria-labelledby='flake-view-title' open={open} onClose={onClose}>
      {body}
    </Modal>
  )
}
