import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import KPICard from '../KPICard'

describe('KPICard', () => {
  it('renders label and value', () => {
    render(<KPICard label="今日产量" value="12,400" />)
    expect(screen.getByText('今日产量')).toBeInTheDocument()
    expect(screen.getByText('12,400')).toBeInTheDocument()
  })

  it('renders unit when provided', () => {
    render(<KPICard label="OEE" value="73.2" unit="%" />)
    expect(screen.getByText('%')).toBeInTheDocument()
  })

  it('does not render unit when not provided', () => {
    const { container } = render(<KPICard label="产量" value="100" />)
    const spans = container.querySelectorAll('span')
    // Only the value span, no unit span
    expect(spans.length).toBe(1)
  })
})
