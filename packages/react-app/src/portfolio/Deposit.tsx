import React, { useState } from "react"
import { Input } from '../components/index'

function Deposit({ onDeposit } : { onDeposit: (event: number) => void } ) {
  const [value, setValue] = useState(5000)
  const depositUpdated = (event: any) => {
    const { value } = event.target
    setValue(value)
    onDeposit(event.target.value)
  }


  return (
    <div style={{ marginLeft: '1rem' }}>
      <label>Enter amount you would like to Deposit</label>
      <Input type="number" onChange={depositUpdated} value={value} />
    </div>
  )
}

export { Deposit }