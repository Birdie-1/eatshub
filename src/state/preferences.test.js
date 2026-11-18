import { describe, expect, it } from 'vitest'
import { DEFAULT_RIDER_STATUS, restoreRiderStatus } from './preferences'

describe('rider status (R2 switches)', () => {
  it('starts online with auto-accept on, as in the spec screenshot', () => {
    expect(DEFAULT_RIDER_STATUS).toEqual({ online: true, autoAccept: true })
    expect(restoreRiderStatus(undefined)).toEqual(DEFAULT_RIDER_STATUS)
  })
  it('keeps saved switch values', () => {
    expect(restoreRiderStatus({ online: false, autoAccept: false })).toEqual({
      online: false,
      autoAccept: false,
    })
    expect(restoreRiderStatus({ online: false })).toEqual({ online: false, autoAccept: true })
  })
  it('ignores corrupt or unknown saved values', () => {
    expect(restoreRiderStatus('yes')).toEqual(DEFAULT_RIDER_STATUS)
    expect(restoreRiderStatus(null)).toEqual(DEFAULT_RIDER_STATUS)
    expect(restoreRiderStatus({ online: 'false', autoAccept: 0, extra: true })).toEqual(DEFAULT_RIDER_STATUS)
  })
})
