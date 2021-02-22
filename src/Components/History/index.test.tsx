import React from 'react'
import { History } from './index'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
const bigTx = require('./bigUsers.json')

const testHistory = [
  {
    action: 'query',
    param: { select: ['*'], from: '_collection' },
    type: 'Query'
  },
  {
    action: 'query',
    param: { select: ['*'], from: '_predicate' },
    type: 'Query'
  },
  {
    action: 'transact',
    param: [
      { _id: '_collection', name: 'foo' },
      { _id: '_predicate', name: 'foo/bar', type: 'string' }
    ]
  }
]

// const bigTxItem = {
//   action: 'transact',
//   param: JSON.parse(bigTx)
// }

describe('history component', () => {
  test('history does not attempt to create list from empty history', () => {
    render(<History history={[]} />)
    const list = screen.getByRole('list')
    expect(list).toBeInTheDocument()
    const listItem = screen.queryAllByRole('listitem')
    expect(listItem.length).toBe(0)
  })

  test('when passed an array of history objects, they will be listed accordingly', () => {
    render(<History history={testHistory} />)
    const listItems = screen.getAllByRole('listitem')
    expect(listItems.length).toBe(3)
  })

  test('clicking on a list item fires loadHistoryItem function', () => {
    const clickHandler = jest.fn()
    render(<History history={testHistory} loadHistoryItem={clickHandler} />)
    const item = screen.getByText('{"select":["*"],"from":"_predicate"}')
    fireEvent.click(item)
    expect(clickHandler).toBeCalledTimes(1)
    const listItems = screen.getAllByRole('listitem')
    fireEvent.click(listItems[0])
    fireEvent.click(listItems[2])
    fireEvent.click(listItems[1])
    expect(clickHandler).toBeCalledTimes(4)
  })

  // test("excessively large params won't render in full", () => {
  //   render(<History history={[...testHistory, bigTxItem]} />)
  // })
})
