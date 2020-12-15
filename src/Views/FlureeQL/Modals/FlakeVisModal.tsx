// eslint-disable-next-line no-unused-vars
import React, { FunctionComponent } from 'react'
import { Modal, Typography } from '@material-ui/core'
import { GraphView } from '../../FlakeVis'

interface BodyProps {
  flakes: Array<any> | null
  _db: DB
}
interface Props extends BodyProps {
  open: boolean
  onClose: () => void
}

const Body: FunctionComponent<BodyProps> = ({ flakes, _db }) => {
  return (
    <div>
      <Typography variant='h2' id='flake-view-title'>
        Flake View
      </Typography>
      <GraphView flakes={flakes} _db={_db} />
    </div>
  )
}

export const FlakeVisModal: FunctionComponent<Props> = ({
  open,
  onClose,
  flakes,
  _db
}) => {
  return (
    <Modal aria-labelledby='flake-view-title' open={open} onClose={onClose}>
      <Body flakes={flakes} _db={_db} />
    </Modal>
  )
}
