// eslint-disable-next-line no-unused-vars
import React, { FunctionComponent } from 'react'
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
    maxWidth: 'inherit',
    width: 'inherit'
  },
  rootHidden: {
    display: 'none'
  }
}))

interface HistoryProps {
  history: Array<object>
  loadHistoryItem: (item: HistoryObject) => void
  open: boolean
}

interface HistoryObject {
  action: string
  param: object
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

  return (
    <Box className={open ? classes.root : classes.rootHidden}>
      <List>
        <Typography variant='h5'>History</Typography>
        {history.map((item: HistoryObject, i: number) => (
          <ListItem
            key={i}
            onClick={(e) => {
              e.preventDefault()
              loadHistoryItem(item)
            }}
            divider
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
