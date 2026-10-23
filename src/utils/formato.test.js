import { describe, it, expect } from 'vitest'
import { formatearFecha, formatearPesos } from './formato'

describe('formato', () => {
  it('formatearPesos agrega el signo y el punto de miles', () => {
    expect(formatearPesos(0)).toBe('$0')
    expect(formatearPesos(950)).toBe('$950')
    expect(formatearPesos(25000)).toBe('$25.000')
    expect(formatearPesos(1250000)).toBe('$1.250.000')
  })

  it('formatearFecha pasa de AAAA-MM-DD a DD/MM/AAAA', () => {
    expect(formatearFecha('2026-11-02')).toBe('02/11/2026')
  })
})
