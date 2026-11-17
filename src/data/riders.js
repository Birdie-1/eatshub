// Demo rider records: first ten from 07b, followed by seven additional examples.
const records = [
  ['นาย', 'สมชาย', 'ตั้งกันไจ', '090 971 6354', '9กก9324', 'กรุงเทพมหานคร', 'online', 'active'],
  ['นาย', 'สมใจ', 'ตั้งกันเวลา', '099 873 5163', 'นบ9422', 'เชียงใหม่', 'offline', 'block'],
  ['นาย', 'สมคิด', 'วิทยา', '086 384 6135', '5กก2345', 'กรุงเทพมหานคร', 'offline', 'block'],
  ['นาย', 'สมพงษ์', 'คงกระพัน', '089 716 3549', 'บร942', 'ปราจีนบุรี', 'offline', 'active'],
  ['นาย', 'สมโภชน์', 'ชนากร', '090 972 5448', 'กก945', 'กรุงเทพมหานคร', 'delivery', 'active'],
  ['นาย', 'สมศักดิ์', 'จักรวาล', '090 987 3546', 'นบ9534', 'นนทบุรี', 'offline', 'active'],
  ['นาย', 'สมบัติ', 'มหาศาล', '089 635 7164', '8กข0586', 'กรุงเทพมหานคร', 'online', 'active'],
  ['นาย', 'สมยศ', 'ใหญ่โต', '098 763 5471', '4ฮอ4352', 'ลพบุรี', 'online', 'active'],
  ['นาย', 'สมประสงค์', 'มลคล', '086 273 6451', '3กอ4834', 'กรุงเทพมหานคร', 'delivery', 'active'],
  ['นาง', 'สมหญิง', 'จริงใจ', '081 625 7463', 'บม9432', 'กรุงเทพมหานคร', 'offline', 'block'],
  ['นาย', 'สมเกียรติ', 'ใจดี', '089 123 4567', '1กข1256', 'ขอนแก่น', 'online', 'active'],
  ['นางสาว', 'สมฤดี', 'สุขใจ', '091 234 5678', '2กง4532', 'ขอนแก่น', 'delivery', 'active'],
  ['นาย', 'สมปอง', 'รุ่งเรือง', '092 345 6789', 'กค7821', 'อุดรธานี', 'online', 'active'],
  ['นาย', 'สมพล', 'มั่นคง', '093 456 7890', '3กจ6642', 'เชียงใหม่', 'offline', 'active'],
  ['นางสาว', 'สมพร', 'แสงทอง', '094 567 8901', 'ขข9012', 'นนทบุรี', 'delivery', 'active'],
  ['นาย', 'สมจิตร', 'มีสุข', '095 678 9012', '4กท3321', 'กรุงเทพมหานคร', 'online', 'active'],
  ['นาย', 'สมบูรณ์', 'พูนทรัพย์', '096 789 0123', 'กม7654', 'ขอนแก่น', 'offline', 'active'],
]

export function createRiders(now = new Date()) {
  const timestamp = new Date(now).getTime()
  return records.map(
    ([prefix, firstName, lastName, phone, plate, province, workStatus, riderStatus], index) => ({
      no: index + 1,
      code: `EA${String(index + 1).padStart(5, '0')}`,
      prefix,
      firstName,
      lastName,
      name: `${prefix} ${firstName} ${lastName}`,
      phone,
      plate,
      province,
      workStatus,
      riderStatus,
      isLoggedIn: workStatus !== 'offline',
      lastActiveAt: new Date(timestamp - (index + 1) * 23 * 60 * 1000).toISOString(),
      editedAt: new Date(timestamp - (index + 1) * 4 * 60 * 60 * 1000).toISOString(),
      editedBy: index % 2 ? 'มานะ ใจดี' : 'กรรณนรรต กันอินะ',
      blockReason: riderStatus === 'block' ? 'อยู่ระหว่างตรวจสอบเอกสาร (ข้อมูลตัวอย่าง)' : '',
    }),
  )
}

export const riders = createRiders()
// Shared with checkout / tracking (#11–#12); contact details match the admin list.
export const DEFAULT_RIDER = { ...riders[0], rating: 4.5 }
export const workLabels = { online: 'Online', delivery: 'Delivery', offline: 'Offline' }
export const accountLabels = { active: 'Active', block: 'Block' }
const dateTime = new Intl.DateTimeFormat('th-TH', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Bangkok',
})
export const formatRiderDate = (value) => dateTime.format(new Date(value))

export function changeRiderStatus(rider, status, reason, now = new Date()) {
  if (!Object.hasOwn(accountLabels, status)) throw new Error('สถานะไรเดอร์ไม่ถูกต้อง')
  const blockReason = status === 'block' ? reason?.trim() : ''
  if (status === 'block' && !blockReason) throw new Error('กรุณากรอกเหตุผลการระงับใช้งาน')
  return {
    ...rider,
    riderStatus: status,
    blockReason,
    editedBy: 'Admin',
    editedAt: new Date(now).toISOString(),
  }
}
