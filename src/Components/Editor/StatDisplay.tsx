// eslint-disable-next-line no-unused-vars
import React, { FunctionComponent } from 'react'
import { Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    '& > p:not(:last-child)': { marginRight: 10 }
  },
  stat: {},
  label: { fontWeight: 800, textTransform: 'capitalize' }
}))

interface StatTextProps {
  label: string
  value: string
}

interface StatDisplayProps {
  stats: object
}

export const StatText: FunctionComponent<StatTextProps> = (props) => {
  const classes = useStyles()
  const { label, value } = props
  return (
    <Typography className={classes.stat} component='p' variant='body1'>
      <span className={classes.label}>{`${label}: `}</span>
      {value}
    </Typography>
  )
}

const StatDisplay: FunctionComponent<StatDisplayProps> = (props) => {
  const classes = useStyles()
  const { stats } = props
  return (
    <div className={classes.root}>
      {Object.entries(stats).map(([label, value]) =>
        value ? <StatText label={label} value={value} key={label} /> : null
      )}
      {/* <StatText label="Test" value="testy" /> */}
    </div>
  )
}

export default StatDisplay

// StatDisplay.propTypes = {
//   stats: PropTypes.shape({
//     'Fuel Spent': PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
//     Block: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
//     Status: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
//     Time: PropTypes.string
//   }).isRequired
// };

// StatText.propTypes = {
//   label: PropTypes.string.isRequired,
//   value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
// };
