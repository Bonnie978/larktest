import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Tag from '../Tag'

describe('Tag', () => {
  it('renders children text', () => {
    render(<Tag type="success">正常</Tag>)
    expect(screen.getByText('正常')).toBeInTheDocument()
  })

  it('applies success styles', () => {
    render(<Tag type="success">正常</Tag>)
    const tag = screen.getByText('正常')
    expect(tag.className).toContain('bg-[#E8FFEA]')
    expect(tag.className).toContain('text-[#00B42A]')
  })

  it('applies warning styles', () => {
    render(<Tag type="warning">预警</Tag>)
    const tag = screen.getByText('预警')
    expect(tag.className).toContain('bg-[#FFF7E8]')
    expect(tag.className).toContain('text-[#FF7D00]')
  })

  it('applies danger styles', () => {
    render(<Tag type="danger">异常</Tag>)
    const tag = screen.getByText('异常')
    expect(tag.className).toContain('bg-[#FFECE8]')
    expect(tag.className).toContain('text-[#F53F3F]')
  })

  it('applies default styles', () => {
    render(<Tag type="default">默认</Tag>)
    const tag = screen.getByText('默认')
    expect(tag.className).toContain('bg-muted')
    expect(tag.className).toContain('text-muted-foreground')
  })
})
