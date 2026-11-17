/** Saved delivery addresses (spec 04 §2–3). Shape matches the order's `address: { label, detail }`. */
export const addresses = [
  {
    id: 'home',
    label: 'บ้าน',
    detail: 'ซอย วัชรพล 3 Khlong Thanon, Sai Mai, Bangkok 10220',
  },
  {
    id: 'office',
    label: 'ออฟฟิศ',
    detail: 'อาคารเอ็มไพร์ทาวเวอร์ ถนนสาทรใต้ แขวงยานนาวา เขตสาทร กรุงเทพฯ 10120',
  },
]

export const DEFAULT_ADDRESS_ID = 'home'

export function getAddress(id) {
  return addresses.find((a) => a.id === id) ?? addresses[0]
}
