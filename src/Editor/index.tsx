// eslint-disable-next-line no-unused-vars
import React, { useState, FunctionComponent } from 'react'
import 'ace-builds'
import AceEditor from 'react-ace'
import { Box, Typography, Button } from '@material-ui/core'
import StatDisplay from './StatDisplay'
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
    marginBottom: 10
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
  mode?: string | 'json5'
  title?: string
  readOnly?: boolean
  width?: number | string
  action?: string
  stats?: object | undefined
  onChange?: (value: string) => void
}

export const Editor: FunctionComponent<EditorProps> = ({
  name,
  value,
  theme = 'xcode',
  mode = 'json5',
  title,
  readOnly,
  width,
  action,
  stats,
  onChange
}) => {
  const classes = useStyles()

  const [contents, setContents] = useState('')

  const changeHandler = (value: string) => {
    setContents(value)
  }

  let valueHandler = changeHandler
  if (onChange) {
    valueHandler = onChange
  }

  const formatHandler = () => {
    const newValue = JSON5.stringify(JSON5.parse(value || contents), null, 2)

    console.log(newValue)

    if (onChange) {
      onChange(newValue)
    } else {
      setContents(newValue)
    }
    // if (onChange) {
    //   onChange(
    //     prettier.format(newValue, { parser: 'json', plugins: [babelParser] })
    //   );
    // } else {
    //   setContents(prettier.format(newValue, { parser: 'json', plugins: [babelParser] }));
    // }
  }

  return (
    <Box width={width || 500} p={2} boxSizing='border-box'>
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
          {action === 'results' && typeof stats !== 'undefined' ? (
            <StatDisplay stats={stats} />
          ) : null}
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
        readOnly={readOnly || false}
        width='100%'
        showPrintMargin={false}
      />
    </Box>
  )
}
