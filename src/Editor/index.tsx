// eslint-disable-next-line no-unused-vars
import React, { useState, FunctionComponent } from 'react'
import 'ace-builds'
import AceEditor from 'react-ace'
import { Box, Typography, Button } from '@material-ui/core'
import StatDisplay from './StatDisplay'
import { makeStyles } from '@material-ui/core/styles'

import 'ace-builds/webpack-resolver'
import 'ace-builds/src-noconflict/theme-xcode'
import 'ace-builds/src-noconflict/mode-json'
// import 'ace-builds/src-noconflict/ext-beautify'

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
  theme?: string
  mode?: string
  title?: string
  readOnly?: boolean
  width?: number | string
  queryLang?: string
  action?: string
  defaultValue?: string
  stats?: object | undefined
  onChange?: (value: string) => void
}

export const Editor: FunctionComponent<EditorProps> = (props) => {
  const classes = useStyles()
  let mode = 'json'
  if (props.mode) {
    mode = props.mode
  }

  const [contents, setContents] = useState('')

  const changeHandler = (value: string) => {
    setContents(value)
  }

  let valueHandler = changeHandler
  if (props.onChange) {
    valueHandler = props.onChange
  }

  const formatHandler = () => {
    const newValue = JSON.stringify(
      JSON.parse(props.value ? props.value : contents),
      null,
      2
    )

    console.log(newValue)

    if (props.onChange) {
      props.onChange(newValue)
    } else {
      setContents(newValue)
    }
    // if (props.onChange) {
    //   props.onChange(
    //     prettier.format(newValue, { parser: 'json', plugins: [babelParser] })
    //   );
    // } else {
    //   setContents(prettier.format(newValue, { parser: 'json', plugins: [babelParser] }));
    // }
  }

  return (
    <Box width={props.width || 500} p={2} boxSizing='border-box'>
      <div className={classes.headerBar}>
        <Typography variant='h4'>{props.title}</Typography>
        <div className={classes.optionBar}>
          {!props.readOnly && (
            <Button color='primary' variant='contained' onClick={formatHandler}>
              Beautify
            </Button>
          )}
          {props.action === 'results' && typeof props.stats !== 'undefined' ? (
            <StatDisplay stats={props.stats} />
          ) : null}
        </div>
      </div>
      <AceEditor
        name={props.name}
        mode={mode}
        theme='xcode'
        highlightActiveLine
        tabSize={2}
        editorProps={{ $blockScrolling: true }}
        value={props.value || contents}
        onChange={valueHandler}
        readOnly={props.readOnly || false}
        width='100%'
        showPrintMargin={false}
      />
    </Box>
  )
}
