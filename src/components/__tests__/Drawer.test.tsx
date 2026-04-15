import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
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

  it('renders title when open', () => {
    render(
      <Drawer open={true} onClose={() => {}} title="测试标题">
        <div>内容</div>
      </Drawer>
    )
    expect(screen.getByText('测试标题')).toBeInTheDocument()
  })

  it('renders children content', () => {
    render(
      <Drawer open={true} onClose={() => {}} title="标题">
        <div>子内容测试</div>
      </Drawer>
    )
    expect(screen.getByText('子内容测试')).toBeInTheDocument()
  })

  it('renders with custom width style', () => {
    render(
      <Drawer open={true} onClose={() => {}} title="详情" width="600px">
        <div>宽抽屉</div>
      </Drawer>
    )
    expect(screen.getByText('宽抽屉')).toBeInTheDocument()
  })
})
