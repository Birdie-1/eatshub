import { describe, expect, it } from 'vitest'
import { categories, findRestaurants, getRestaurant, restaurants, toCartRestaurant } from './restaurants'
import { getMenu, menus, menusOf } from './menus'
import { rachaAhan } from '@/state/fixtures'

const names = (list) => list.map((r) => r.name)

describe('restaurant data', () => {
  it('has the 6 restaurants from spec 04', () => {
    expect(names(restaurants)).toEqual([
      'ราชาอาหาร',
      'แม่แดง ก๋วยเตี๋ยวลงเรือ',
      'ลูกชิ้นทอด แม่ประนอม',
      'หมูทอดเจ๊จง',
      'อินเดีย ฟูด (เจริญนคร)',
      'ปิ้งย่างในตำนาน',
    ])
  })

  it('uses the spec prices for ราชาอาหาร', () => {
    const prices = Object.fromEntries(menusOf('racha-ahan').map((m) => [m.name, m.price]))
    expect(prices).toEqual({
      สุกี้รวมมิตร: 102,
      ลูกชิ้นทอด: 15,
      ทาโกะยากิ: 45,
      บะหมี่หมูแดง: 88,
      'บะหมี่เป็ดย่าง (ใหญ่)': 150,
      ข้าวหมูแดง: 88,
      ข้าวหมูกรอบ: 88,
      บะหมี่เป็ดย่าง: 95,
    })
  })

  it('gives สุกี้รวมมิตร the spec options and add-ons', () => {
    const suki = getMenu('suki-ruam-mit')
    expect(suki.options.map((o) => o.label)).toEqual(['สุกี้น้ำ', 'สุกี้แห้ง'])
    expect(suki.addonGroups[0]).toMatchObject({ name: 'ตัวเลือกเพิ่มวัตถุดิบ', min: 1, max: 4 })
    expect(suki.addonGroups[0].items).toHaveLength(6)
  })

  it('keeps the cart snapshot of ราชาอาหาร in sync with the state fixture', () => {
    const { image: _image, ...snapshot } = toCartRestaurant(getRestaurant('racha-ahan'))
    const { image: _fixtureImage, ...fixture } = rachaAhan
    expect(snapshot).toEqual(fixture)
  })

  it.each(restaurants.map((r) => [r.name, r]))('%s is internally consistent', (_name, r) => {
    const own = menusOf(r.id)
    expect(own.length).toBeGreaterThanOrEqual(6)
    expect(own.length).toBeLessThanOrEqual(10)
    expect(r.menuSections.length).toBeGreaterThanOrEqual(2)
    expect(r.menuSections.length).toBeLessThanOrEqual(3)
    expect(own.some((m) => m.options.length > 0 || m.addonGroups.length > 0)).toBe(true)

    // every listed menu belongs to this store, and every menu of the store is listed somewhere
    const listed = new Set([...r.featuredMenuIds, ...r.menuSections.flatMap((s) => s.menuIds)])
    for (const id of listed) expect(getMenu(id)?.restaurantId).toBe(r.id)
    for (const m of own) expect(listed.has(m.id)).toBe(true)

    expect(r.categoryIds.length).toBeGreaterThanOrEqual(1)
    expect(r.categoryIds.length).toBeLessThanOrEqual(3)
    for (const id of r.categoryIds) expect(categories.some((c) => c.id === id)).toBe(true)

    expect(r.minOrder).toBeGreaterThanOrEqual(50)
    expect(r.minOrder).toBeLessThanOrEqual(100)
    expect(r.deliveryFee).toBeGreaterThanOrEqual(10)
    expect(r.deliveryFee).toBeLessThanOrEqual(25)
    expect(r.distanceKm).toBeGreaterThanOrEqual(0.8)
    expect(r.distanceKm).toBeLessThanOrEqual(5)
    expect(r.rating).toBeGreaterThanOrEqual(4.2)
    expect(r.rating).toBeLessThanOrEqual(4.8)
  })

  it('has unique menu ids', () => {
    expect(new Set(menus.map((m) => m.id)).size).toBe(menus.length)
  })

  it('has 19 categories', () => {
    expect(categories).toHaveLength(19)
  })
})

describe('findRestaurants', () => {
  it('matches restaurant names, types and menu names, ignoring case', () => {
    expect(names(findRestaurants({ q: 'ก๋วยเตี๋ยว' }))).toContain('แม่แดง ก๋วยเตี๋ยวลงเรือ')
    expect(names(findRestaurants({ q: 'สุกี้' }))).toEqual(['ราชาอาหาร'])
    expect(names(findRestaurants({ q: 'อาหารอินเดีย' }))).toEqual(['อินเดีย ฟูด (เจริญนคร)'])
    expect(findRestaurants({ q: '  ' })).toHaveLength(6)
    expect(findRestaurants({ q: 'ไม่มีร้านนี้' })).toEqual([])
  })

  it('filters by category, with popular categories never empty', () => {
    for (const id of ['thai', 'noodles', 'street-food', 'made-to-order']) {
      expect(findRestaurants({ categoryId: id }).length).toBeGreaterThan(0)
    }
    expect(findRestaurants({ categoryId: 'sushi' })).toEqual([])
  })

  it('combines filters', () => {
    expect(names(findRestaurants({ categoryId: 'noodles', type: 'ก๋วยเตี๋ยว' }))).toEqual(['แม่แดง ก๋วยเตี๋ยวลงเรือ'])
  })
})
