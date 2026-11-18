import { describe, expect, it } from 'vitest'
import { changeRiderStatus, createRiders, DEFAULT_RIDER, riders } from './riders'

const now = new Date('2026-11-17T06:00:00Z')

describe('rider demo data contract', () => {
  it('provides 17 unique sequential codes and the specified status distribution', () => {
    const data = createRiders(now)
    expect(data.map((rider) => rider.code)).toEqual(
      Array.from({ length: 17 }, (_, i) => `EA${String(i + 1).padStart(5, '0')}`),
    )
    expect(data.filter((rider) => rider.workStatus === 'online')).toHaveLength(6)
    expect(data.filter((rider) => rider.workStatus === 'delivery')).toHaveLength(4)
    expect(data.filter((rider) => rider.workStatus === 'offline')).toHaveLength(7)
    expect(data.filter((rider) => rider.riderStatus === 'block')).toHaveLength(3)
    for (const rider of data) expect(rider.isLoggedIn).toBe(rider.workStatus !== 'offline')
  })
  it('credits edits to fictional admins only, not the staff name in the original screenshots', () => {
    const editors = new Set(createRiders(now).map((rider) => rider.editedBy))
    expect([...editors].sort()).toEqual(['ชูใจ ใฝ่ดี', 'มานะ ใจดี'].sort())
  })
  it('uses unique phone numbers on the unallocated 010 prefix so no real person can be reached', () => {
    const phones = createRiders(now).map((rider) => rider.phone)
    for (const phone of phones) expect(phone).toMatch(/^010 \d{3} \d{4}$/)
    expect(new Set(phones).size).toBe(phones.length)
  })
  it('keeps dates recent relative to the time the demo opens', () => {
    for (const rider of createRiders(now)) {
      const age = now.getTime() - Date.parse(rider.lastActiveAt)
      expect(age).toBeGreaterThan(0)
      expect(age).toBeLessThan(24 * 60 * 60 * 1000)
    }
  })
  it('exports the same rider identity and contact for customer tracking', () => {
    expect(DEFAULT_RIDER).toMatchObject(riders[0])
    expect(DEFAULT_RIDER).toMatchObject({
      code: 'EA00001',
      name: 'นาย สมชาย ตั้งกันไจ',
      phone: '010 971 6354',
      rating: 4.5,
    })
  })
})

describe('demo account status changes', () => {
  it.each(['', '   ', undefined])('rejects a missing block reason (%s)', (reason) => {
    expect(() => changeRiderStatus(riders[0], 'block', reason, now)).toThrow('กรุณากรอกเหตุผล')
  })
  it('records the trimmed reason and audit fields without mutating the source', () => {
    const original = createRiders(now)[0]
    const changed = changeRiderStatus(original, 'block', '  ตรวจสอบเอกสาร  ', now)
    expect(changed).toMatchObject({
      riderStatus: 'block',
      blockReason: 'ตรวจสอบเอกสาร',
      editedBy: 'Admin',
      editedAt: now.toISOString(),
    })
    expect(original.riderStatus).toBe('active')
    expect(original.blockReason).toBe('')
  })
  it('reactivates without a reason, clears the old reason and can reset to fixtures', () => {
    const blocked = changeRiderStatus(riders[0], 'block', 'เอกสารไม่ครบ', now)
    expect(changeRiderStatus(blocked, 'active', '', now)).toMatchObject({
      riderStatus: 'active',
      blockReason: '',
      editedBy: 'Admin',
    })
    expect(createRiders(now)[0].riderStatus).toBe('active')
  })
  it('rejects unsupported account states', () => {
    expect(() => changeRiderStatus(riders[0], 'deleted', '', now)).toThrow('สถานะไรเดอร์ไม่ถูกต้อง')
  })
})
