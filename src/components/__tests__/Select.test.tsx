import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Select from '../Select'

const options = [
  { label: 'A线', value: 'a' },
  { label: 'B线', value: 'b' },
]

describe('Select', () => {
  it('renders label as first option', () => {
    render(<Select label="所有产线" value="" options={options} onChange={() => {}} />)
    expect(screen.getByText('所有产线')).toBeInTheDocument()
  })

  it('renders all options', () => {
    render(<Select label="所有产线" value="" options={options} onChange={() => {}} />)
    expect(screen.getByText('A线')).toBeInTheDocument()
    expect(screen.getByText('B线')).toBeInTheDocument()
  })

  it('calls onChange when selection changes', () => {
    const onChange = vi.fn()
    render(<Select label="所有产线" value="" options={options} onChange={onChange} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'a' } })
    expect(onChange).toHaveBeenCalledWith('a')
  })
})
