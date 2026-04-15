import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Select from '../Select'

const options = [
  { label: 'A线', value: 'a' },
  { label: 'B线', value: 'b' },
]

describe('Select', () => {
  it('renders trigger with placeholder label', () => {
    render(<Select label="所有产线" value="" options={options} onChange={() => {}} />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('renders the component without errors', () => {
    const { container } = render(
      <Select label="所有产线" value="" options={options} onChange={() => {}} />
    )
    expect(container).toBeTruthy()
  })

  it('displays the trigger button', () => {
    render(<Select label="所有产线" value="a" options={options} onChange={() => {}} />)
    const trigger = screen.getByRole('combobox')
    expect(trigger).toBeInTheDocument()
  })
})
