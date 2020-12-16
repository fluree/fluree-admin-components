// eslint-disable-next-line no-unused-vars
import React, { FunctionComponent } from 'react'
import {
  Card,
  CardContent,
  Typography,
  TableContainer,
  TableBody,
  TableRow,
  TableCell
} from '@material-ui/core'

interface Props {
  node: object | Dictionary
  nodeId: string
}

export const NodeCard: FunctionComponent<Props> = ({ node, nodeId }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant='h6'>{nodeId}</Typography>
        <TableContainer>
          <TableBody>
            {Object.entries(node).map(([key, value]) => {
              return (
                <TableRow key={key}>
                  <TableCell>{key}</TableCell>
                  <TableCell>
                    {typeof value === 'object' ? JSON.stringify(value) : value}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </TableContainer>
      </CardContent>
    </Card>
  )
}
