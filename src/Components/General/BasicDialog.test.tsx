import React, { useState } from 'react'
import { BasicDialog } from './BasicDialog'
import {
  fireEvent,
  render,
  screen,
  cleanup,
  waitForElementToBeRemoved
} from '@testing-library/react'

let open = false
beforeEach(() => {
  open = false
})

afterEach(() => {
  cleanup()
})

test('opens and displays message and button', () => {
  open = true
  render(<BasicDialog open={open} onClose={close} message='Hello There!' />)
  const message = screen.getByText('Hello There!')
  expect(message.textContent).toBe('Hello There!')
  const button = screen.getByRole('button')
  expect(button.textContent).toBe('OK')
})

test('clicking button fires closeHandler', () => {
  const closeHandler = jest.fn()
  open = true
  render(<BasicDialog open={open} onClose={closeHandler} message='Close me' />)
  const message = screen.getByText('Close me')
  expect(message.textContent).toBe('Close me')
  fireEvent.click(screen.getByText('OK'))
  expect(closeHandler).toBeCalled()
})

test('dialog does not mount when not open', () => {
  render(
    <BasicDialog open={open} onClose={jest.fn()} message="I don't exist" />
  )
  const message = screen.queryByText("I don't exist")
  expect(message).toBeFalsy()
  const button = screen.queryByRole('button')
  expect(button).toBeFalsy()
})

test('dialog opens and closes properly', async () => {
  const message = 'Now you see me...'
  const Wrapper = () => {
    const [testOpen, setTestOpen] = useState(false)
    const closeHandler = () => setTestOpen(false)
    return (
      <>
        <button onClick={() => setTestOpen(true)}>Open</button>
        <BasicDialog open={testOpen} onClose={closeHandler} message={message} />
      </>
    )
  }
  render(<Wrapper />)
  const notThere = screen.queryByText(message)
  expect(notThere).toBeNull()
  fireEvent.click(screen.getByText('Open'))
  const displayed = screen.getByText(message)
  expect(displayed.textContent).toBe(message)
  fireEvent.click(screen.getByText('OK'))
  await waitForElementToBeRemoved(() => screen.queryByText(message))
  const noMessage = screen.queryByText(message)
  expect(noMessage).toBeNull()
})
