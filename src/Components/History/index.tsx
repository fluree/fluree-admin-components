// eslint-disable-next-line no-unused-vars
import React, { FunctionComponent, useState, useEffect } from 'react'
import { List, ListItem, ListItemText } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  itemClickable: {
    cursor: 'pointer'
  },
  item: {
    overflow: 'hidden',
    textOverflow: 'fade'
  }
}))

export const History: FunctionComponent<HistoryProps> = ({
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
    <div>
      <List disablePadding>
        {history &&
          history.map((item: HistoryObject, i: number) => (
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
                  item.action === 'transact'
                    ? `${item.action}`.toUpperCase()
                    : `${item.action}: ${item.type}`.toUpperCase()
                }
                secondary={JSON.stringify(item.param).slice(0, 40)}
              />
            </ListItem>
          ))}
      </List>
    </div>
  )
}
