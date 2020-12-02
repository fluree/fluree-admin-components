// eslint-disable-next-line no-unused-vars
import React, { FunctionComponent, useState, useEffect } from 'react'
import { List, ListItem, ListItemText, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  header: {
    marginLeft: theme.spacing(2),
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  itemClickable: {
    cursor: 'pointer'
  },
  item: {
    overflow: 'hidden',
    textOverflow: 'fade'
  }
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
    <List disablePadding>
      <Typography variant='h5' className={classes.header}>
        History
      </Typography>
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
          divider={!(history.length - 1 === i)}
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
