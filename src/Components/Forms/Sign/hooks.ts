// eslint-disable-next-line no-unused-vars
import { useState, ChangeEvent } from 'react'

export default function useSignForm(defaultKey?: string) {
  const [signForm, setSignForm] = useState<SignedTransactionForm>({
    expire: `${Date.now() + 180000}`,
    maxFuel: '1000000',
    nonce: `${Math.ceil(Math.random() * 100)}`,
    privateKey: defaultKey || '',
    auth: null
  })

  const rollNonce = () => {
    setSignForm({ ...signForm, nonce: `${Math.ceil(Math.random() * 100)}` })
  }

  const refreshExpire = () => {
    setSignForm({ ...signForm, expire: `${Date.now() + 180000}` })
  }

  const signFormHandler = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setSignForm({ ...signForm, [event.target.name]: event.target.value })
  }

  const clearTxFormAuth = () => {
    setSignForm({ ...signForm, auth: '' })
  }

  return {
    signForm,
    setSignForm,
    rollNonce,
    refreshExpire,
    signFormHandler,
    clearTxFormAuth
  }
}
