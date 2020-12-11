// eslint-disable-next-line no-unused-vars
import React, { useState, FunctionComponent } from 'react'
import 'ace-builds'
import AceEditor from 'react-ace'
import { Box, Typography, Button, IconButton } from '@material-ui/core'
import VisibilityIcon from '@material-ui/icons/Visibility'
import StatDisplay from './StatDisplay'
import { BasicDialog } from '../General/BasicDialog'
import { makeStyles } from '@material-ui/core/styles'
import JSON5 from 'json5'
import { flureeFetch } from '../utils/flureeFetch'

import 'ace-builds/webpack-resolver'
import 'ace-builds/src-noconflict/theme-xcode'
import 'ace-builds/src-noconflict/theme-dracula'
import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/mode-json5'
import 'ace-builds/src-noconflict/mode-sparql'
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
  },
  introspectButton: {
    position: 'absolute',
    bottom: theme.spacing(3),
    right: theme.spacing(3),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    zIndex: 10,
    '&:hover': {
      backgroundColor: theme.palette.primary.contrastText,
      color: theme.palette.primary.main
    }
  }
}))

interface EditorProps {
  name?: string
  value?: string
  theme?: 'dracula' | 'xcode'
  mode?: 'json' | 'json5' | 'sparql'
  title?: string
  readOnly?: boolean
  width?: number | string
  action?: 'query' | 'transact' | 'results'
  stats?: object
  height?: string
  onChange?: (value: string | undefined) => void
  _db?: DB
  token?: string
}

export const Editor: FunctionComponent<EditorProps> = ({
  name,
  value,
  theme = 'xcode',
  mode = 'json5',
  title,
  readOnly = false,
  width = 500,
  height,
  action,
  stats,
  _db,
  token,
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

  const introspect = async () => {
    let data: string
    if (value) data = value
    else data = contents
    if (!data) return
    const parsedData = JSON5.parse(data)
    if (!parsedData.flakes || _db === undefined) {
      return
    }
    const { flakes } = parsedData
    console.log(flakes)
    const _ids: Array<number> = []
    for (const flake of flakes) {
      for (const item of flake) {
        if (typeof item === 'number') {
          if (!_ids.includes(item)) {
            _ids.push(item)
          }
        }
      }
    }
    console.log(_ids)
    const metaQuery = {}
    for (const id of _ids) {
      metaQuery[id] = { selectOne: ['*'], from: id, opts: { compact: true } }
    }
    const dbName = typeof _db.db === 'string' ? _db.db : _db.db['db/id']
    const fullDb = dbName.split('/')
    try {
      const metaResults = await flureeFetch({
        ip: _db.ip,
        body: metaQuery,
        auth: token,
        network: fullDb[0],
        endpoint: 'multi-query',
        db: fullDb[1]
      })
      console.log(metaResults)
      if (metaResults.status >= 500) {
        throw new Error(metaResults.data.message)
      }
      const idData = metaResults.data
      const parsedFlakes = flakes.map((flake: any) =>
        flake.map((f: any) => {
          if (idData[f] && idData[f].name) {
            return idData[f].name
          } else return f
        })
      )
      console.log({ parsedFlakes })
      parsedData.flakes = parsedFlakes
      const finalData = JSON5.stringify(parsedData, null, 2)
      if (onChange) onChange(finalData)
      else setContents(finalData)
    } catch (err) {
      setError(err.message)
      setOpenError(true)
    }
  }

  return (
    <Box width={width} p={2} boxSizing='border-box'>
      <div className={classes.headerBar}>
        <Typography variant='h4'>{title}</Typography>
        <div className={classes.optionBar}>
          {!readOnly && (mode === 'json' || mode === 'json5') && (
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
        wrapEnabled
        height={height}
      />
      <BasicDialog
        message={error}
        open={openError}
        onClose={() => {
          setOpenError(false)
          setError('')
        }}
      />
      {action === 'results' && (
        <IconButton
          className={classes.introspectButton}
          size='small'
          onClick={introspect}
          disabled={value === undefined ? !contents : !value}
        >
          <VisibilityIcon fontSize='small' color='inherit' />
        </IconButton>
      )}
    </Box>
  )
}
