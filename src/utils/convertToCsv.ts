export function convertArrayOfObjectsToCSV(args: any) {
  var result: string,
    ctr: number,
    keys: Array<string>,
    columnDelimiter: string,
    lineDelimiter: string,
    data: Array<object>

  data = args.data || null
  if (data == null || !data.length) {
    return null
  }

  columnDelimiter = args.columnDelimiter || ','
  lineDelimiter = args.lineDelimiter || '\n'

  keys = Object.keys(data[0])

  result = ''
  result += keys.join(columnDelimiter)
  result += lineDelimiter

  data.forEach(function (item) {
    ctr = 0
    keys.forEach(function (key) {
      if (ctr > 0) result += columnDelimiter

      result += item[key]
      ctr++
    })
    result += lineDelimiter
  })

  return result
}
