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
    width: '100%'
  },
  rootHidden: {
    display: 'none'
  }
}))

interface HistoryProps {
  history: Array<object>
  loadHistoryItem?: (action: string, param: object) => void | undefined
  open: boolean
}

interface HistoryObject {
  action: string
  param: object
}

const History: FunctionComponent<HistoryProps> = (
  { history, loadHistoryItem, open },
  ...rest
) => {
  const classes = useStyles()
  // const savedHistory: string | undefined | null = localStorage.getItem(
  //   `${dbName}_history`
  // )
  // const [history, setHistory] = useState(
  //   savedHistory ? JSON.parse(savedHistory) : []
  // )

  const [active, setActive] = useState<number | null>(null)

  return (
    <Box
      {...rest}
      maxWidth
      className={open ? classes.root : classes.rootHidden}
    >
      <List>
        <Typography variant='h5'>History</Typography>
        {history.map((item: HistoryObject, i: number) => (
          <ListItem
            key={i}
            onClick={
              loadHistoryItem
                ? () => {
                    loadHistoryItem(item.action, item.param)
                    setActive(i)
                  }
                : undefined
            }
            divider
            selected={active === i}
          >
            <ListItemText
              primary={item.action}
              secondary={JSON.stringify(item.param)}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  )
}

export default History
