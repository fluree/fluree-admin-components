// eslint-disable-next-line no-unused-vars
import React, { useState, FunctionComponent } from 'react'
import 'ace-builds'
import AceEditor from 'react-ace'
import { Box, Typography, Button } from '@material-ui/core'
import StatDisplay from './StatDisplay'
import BasicDialog from '../General/BasicDialog'
import { makeStyles } from '@material-ui/core/styles'
import JSON5 from 'json5'

import 'ace-builds/webpack-resolver'
import 'ace-builds/src-noconflict/theme-xcode'
import 'ace-builds/src-noconflict/theme-dracula'
import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/mode-json5'
import 'ace-builds/src-noconflict/ext-beautify'

const useStyles = makeStyles((theme) => ({
  headerBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    minHeight: 50
  },
  optionBar: {
    display: 'flex',
    alignItems: 'flex-end',
    padding: theme.spacing(1)
  }
}))

interface EditorProps {
  name?: string
  value?: string
  theme?: 'dracula' | 'xcode'
  mode?: 'json' | 'json5'
  title?: string
  readOnly?: boolean
  width?: number | string
  action?: string
  stats?: object
  onChange?: (value: string) => void
}

export const Editor: FunctionComponent<EditorProps> = ({
  name,
  value,
  theme = 'xcode',
  mode = 'json5',
  title,
  readOnly = false,
  width = 500,
  action,
  stats,
  onChange
}) => {
  const classes = useStyles()

  const [contents, setContents] = useState('')
  const [error, setError] = useState('')
  const [openError, setOpenError] = useState(false)

  const changeHandler = (value: string) => {
    setContents(value)
  }

  let valueHandler = changeHandler
  if (onChange) {
    valueHandler = onChange
  }

  const formatHandler = () => {
    const parse = mode === 'json' ? JSON.parse : JSON5.parse
    const stringify = mode === 'json' ? JSON.stringify : JSON5.stringify
    try {
      const newValue = stringify(parse(value || contents), null, 2)

      console.log(newValue)

      if (onChange) {
        onChange(newValue)
      } else {
        setContents(newValue)
      }
    } catch (err) {
      console.log(err.message)
      setError(err.message)
      setOpenError(true)
      // const errMessage = `${value || contents} \n // ${err.message}`
      // console.log(errMessage)
      // if (onChange) {
      //   onChange(errMessage)
      // } else {
      //   setContents(errMessage)
      // }
    }
  }

  return (
    <Box width={width} p={2} boxSizing='border-box'>
      <div className={classes.headerBar}>
        <Typography variant='h4'>{title}</Typography>
        <div className={classes.optionBar}>
          {!readOnly && (
            <Button
              color='primary'
              variant='contained'
              onClick={formatHandler}
              size='small'
            >
              Beautify
            </Button>
          )}
          {action === 'results' && stats && <StatDisplay stats={stats} />}
        </div>
      </div>
      <AceEditor
        name={name}
        mode={mode}
        theme={theme}
        highlightActiveLine
        tabSize={2}
        editorProps={{ $blockScrolling: true }}
        value={value || contents}
        onChange={valueHandler}
        readOnly={readOnly}
        width='100%'
        showPrintMargin={false}
      />
      <BasicDialog
        message={error}
        open={openError}
        onClose={() => {
          setOpenError(false)
          setError('')
        }}
      />
    </Box>
  )
}
