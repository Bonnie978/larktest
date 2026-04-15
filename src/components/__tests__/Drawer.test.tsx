import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Drawer from '../Drawer'

describe('Drawer', () => {
  it('renders title and children when open', () => {
    render(
      <Drawer open={true} onClose={() => {}} title="详情">
        <div>内容区域</div>
      </Drawer>
    )
    expect(screen.getByText('详情')).toBeInTheDocument()
    expect(screen.getByText('内容区域')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(
      <Drawer open={true} onClose={onClose} title="详情">
        <div>内容</div>
      </Drawer>
    )
    fireEvent.click(screen.getByText('X'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('applies translate-x-full class when closed', () => {
    const { container } = render(
      <Drawer open={false} onClose={() => {}} title="详情">
        <div>内容</div>
      </Drawer>
    )
    const panel = container.querySelector('.translate-x-full')
    expect(panel).toBeInTheDocument()
  })

  it('applies translate-x-0 class when open', () => {
    const { container } = render(
      <Drawer open={true} onClose={() => {}} title="详情">
        <div>内容</div>
      </Drawer>
    )
    const panel = container.querySelector('.translate-x-0')
    expect(panel).toBeInTheDocument()
  })
})
