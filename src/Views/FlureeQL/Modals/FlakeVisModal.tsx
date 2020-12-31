// eslint-disable-next-line no-unused-vars
import React, { FunctionComponent } from 'react'
import { Grid, Modal, Typography, makeStyles } from '@material-ui/core'
import { GraphView } from '../../../Components/GraphView'
import JSON5 from 'json5'

interface Props {
  flakes: Array<Flake> | null
  _db: DB
  open: boolean
  onClose: () => void
}

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 1200,
    maxHeight: 900,
    height: '100%',
    width: '100%',
    background: 'white',
    margin: '0 auto',
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  header: { textAlign: 'center' },
  flakeJSON: {
    wordWrap: 'break-word',
    fontFamily: 'Mono'
  }
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
      <Grid container>
        <Grid item sm={8}>
          <GraphView flakes={flakes} _db={_db} height={400} width={600} />
        </Grid>
        <Grid sm={4} item>
          {flakes && (
            <Typography className={classes.flakeJSON}>
              {JSON5.stringify(flakes, null, 2)}
            </Typography>
          )}
        </Grid>
      </Grid>
    </div>
  )

  return (
    <Modal aria-labelledby='flake-view-title' open={open} onClose={onClose}>
      {body}
    </Modal>
  )
}
