// eslint-disable-next-line no-unused-vars
import React, { useState, FunctionComponent } from 'react'
import {
  Card,
  CardContent,
  Typography,
  TableContainer,
  TableBody,
  TableRow,
  TableCell,
  IconButton
} from '@material-ui/core'
import VisibilityIcon from '@material-ui/icons/Visibility'
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff'
interface Props {
  node: object | Dictionary
  nodeId: string
  altNode?: object | null
}

export const NodeCard: FunctionComponent<Props> = ({
  node,
  nodeId,
  altNode
}) => {
  const [viewAlt, setViewAlt] = useState(false)

  function handleVis() {
    setViewAlt(!viewAlt)
  }
  return (
    <Card>
      <CardContent>
        <Typography variant='h6'>{nodeId}</Typography>
        <IconButton disabled={!altNode} onClick={handleVis}>
          {viewAlt ? <VisibilityIcon /> : <VisibilityOffIcon />}
        </IconButton>
        <TableContainer>
          <TableBody>
            {Object.entries(viewAlt && altNode ? altNode : node).map(
              ([key, value]) => {
                return (
                  <TableRow key={key}>
                    <TableCell>{key}</TableCell>
                    <TableCell>
                      {typeof value === 'object' || typeof value === 'boolean'
                        ? JSON.stringify(value)
                        : value}
                    </TableCell>
                  </TableRow>
                )
              }
            )}
          </TableBody>
        </TableContainer>
      </CardContent>
    </Card>
  )
}
