// eslint-disable-next-line no-unused-vars
import React, { FunctionComponent, useState, useEffect } from 'react'
import { List, ListItem, ListItemText, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
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
}

interface HistoryObject {
  action: string
  param: object
  type?: string
}

const History: FunctionComponent<HistoryProps> = ({
  history,
  loadHistoryItem
}) => {
  const classes = useStyles()
  // const savedHistory: string | undefined | null = localStorage.getItem(
  //   `${dbName}_history`
  // )
  // const [history, setHistory] = useState(
  //   savedHistory ? JSON.parse(savedHistory) : []
  // )

  const [active, setActive] = useState<number | null>(null)

  useEffect(() => {
    setActive(null)
  }, [history])

  return (
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
  )
}

export default History
