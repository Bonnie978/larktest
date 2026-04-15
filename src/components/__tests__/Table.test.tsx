import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Table, { type Column } from '../Table'

interface TestRow {
  id: string
  name: string
  value: number
}

const columns: Column<TestRow>[] = [
  { key: 'id', title: 'ID' },
  { key: 'name', title: '名称' },
  { key: 'value', title: '数值', render: (val: number) => `${val}%` },
]

const data: TestRow[] = [
  { id: '1', name: 'A线', value: 85 },
  { id: '2', name: 'B线', value: 72 },
]

describe('Table', () => {
  it('renders column headers', () => {
    render(<Table columns={columns} data={data} rowKey="id" />)
    expect(screen.getByText('ID')).toBeInTheDocument()
    expect(screen.getByText('名称')).toBeInTheDocument()
    expect(screen.getByText('数值')).toBeInTheDocument()
  })

  it('renders row data', () => {
    render(<Table columns={columns} data={data} rowKey="id" />)
    expect(screen.getByText('A线')).toBeInTheDocument()
    expect(screen.getByText('B线')).toBeInTheDocument()
  })

  it('uses custom render function', () => {
    render(<Table columns={columns} data={data} rowKey="id" />)
    expect(screen.getByText('85%')).toBeInTheDocument()
    expect(screen.getByText('72%')).toBeInTheDocument()
  })

  it('calls onRowClick when row is clicked', () => {
    const onClick = vi.fn()
    render(<Table columns={columns} data={data} rowKey="id" onRowClick={onClick} />)
    fireEvent.click(screen.getByText('A线'))
    expect(onClick).toHaveBeenCalledWith(data[0])
  })

  it('expands row when expandable and clicked', () => {
    render(
      <Table
        columns={columns}
        data={data}
        rowKey="id"
        expandable={{
          expandedRowRender: (record) => <div>详情: {record.name}</div>,
        }}
      />
    )
    fireEvent.click(screen.getByText('A线'))
    expect(screen.getByText('详情: A线')).toBeInTheDocument()
  })
})
