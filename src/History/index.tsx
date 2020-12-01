// eslint-disable-next-line no-unused-vars
import React, { FunctionComponent, useState } from 'react'
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  root: {
    width: '100%',
    maxHeight: 'inherit',
    height: 'inherit',
    overflowX: 'scroll'
  },
  rootHidden: {
    display: 'none'
  },
  itemClickable: {
    cursor: 'pointer'
  },
  item: {}
}))

interface HistoryProps {
  history: Array<object>
  loadHistoryItem?: (
    action: string,
    param: object,
    type?: string | null
  ) => void | undefined
  open: boolean
}

interface HistoryObject {
  action: string
  param: object
  type?: string
}

const History: FunctionComponent<HistoryProps> = ({
  history,
  loadHistoryItem,
  open
}) => {
  const classes = useStyles()
  // const savedHistory: string | undefined | null = localStorage.getItem(
  //   `${dbName}_history`
  // )
  // const [history, setHistory] = useState(
  //   savedHistory ? JSON.parse(savedHistory) : []
  // )

  const [active, setActive] = useState<number | null>(null)

  return (
    <Box className={open ? classes.root : classes.rootHidden}>
      <List>
        <Typography variant='h5'>History</Typography>
        {history.map((item: HistoryObject, i: number) => (
          <ListItem
            className={loadHistoryItem ? classes.itemClickable : ''}
            key={i}
            onClick={
              loadHistoryItem
                ? () => {
                    loadHistoryItem(item.action, item.param, item.type)
                    setActive(i)
                  }
                : undefined
            }
            divider
            selected={active === i}
          >
            <ListItemText
              className={classes.item}
              primary={
                item.type
                  ? `${item.action}: ${item.type}`.toUpperCase()
                  : `${item.action}`.toUpperCase()
              }
              secondary={JSON.stringify(item.param)}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  )
}

export default History
