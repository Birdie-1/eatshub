import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import Logo from '@/shared/components/Logo'

/**
 * Swipeable banner carousel (C2): scroll-snap track, auto-advances every `interval` ms,
 * dots show (and jump to) the current slide. Swiping restarts the timer.
 */
export default function BannerCarousel({ slides, interval = 4000 }) {
  const trackRef = useRef(null)
  const [index, setIndex] = useState(0)

  const goTo = (i) => {
    const el = trackRef.current
    el?.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' })
  }

  useEffect(() => {
    const id = setTimeout(() => {
      const el = trackRef.current
      if (!el) return
      const next = (index + 1) % slides.length
      el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' })
    }, interval)
    return () => clearTimeout(id)
  }, [index, interval, slides.length])

  const onScroll = () => {
    const el = trackRef.current
    const i = Math.round(el.scrollLeft / el.clientWidth)
    if (i !== index) setIndex(i)
  }

  return (
    <section aria-roledescription="carousel" aria-label="โปรโมชั่น" className="px-4">
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto rounded-2xl"
      >
        {slides.map((s, i) => (
          <div
            key={s.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} จาก ${slides.length}`}
            className="aspect-[2/1] w-full shrink-0 snap-center"
          >
            <SlideLink to={s.to}>
              {s.kind === 'brand' ? <BrandSlide slide={s} /> : <PromoSlide slide={s} />}
            </SlideLink>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-center gap-1.5">
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-label={`ไปที่ภาพที่ ${i + 1}`}
            aria-current={i === index}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all ${i === index ? 'w-5 bg-brand' : 'w-1.5 bg-neutral-300'}`}
          />
        ))}
      </div>
    </section>
  )
}

function SlideLink({ to, children }) {
  const cls = 'relative block size-full overflow-hidden'
  return to ? (
    <Link to={to} className={cls} draggable={false}>
      {children}
    </Link>
  ) : (
    <div className={cls}>{children}</div>
  )
}

function BrandSlide({ slide }) {
  return (
    <div className="flex size-full bg-brand">
      <div className="z-10 flex flex-1 flex-col justify-center gap-1 pl-5">
        <Logo variant="mark" className="size-10" />
        <p className="text-2xl font-bold tracking-tight text-ink">
          eats<span className="text-white">HUB</span>
        </p>
        <p className="text-sm leading-snug font-medium whitespace-pre-line text-ink/80">{slide.subtitle}</p>
      </div>
      <img
        src={slide.image}
        alt=""
        draggable={false}
        className="h-full w-[42%] rounded-l-[999px] object-cover"
      />
    </div>
  )
}

function PromoSlide({ slide }) {
  return (
    <>
      <img src={slide.image} alt="" draggable={false} className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-linear-to-r from-black/75 via-black/45 to-transparent" />
      <div className="relative flex h-full max-w-[65%] flex-col justify-center gap-1 pl-5 text-white">
        <span className="w-fit rounded-full bg-brand px-2 py-0.5 text-[11px] font-semibold text-ink">
          {slide.eyebrow}
        </span>
        <p className="text-xl leading-tight font-bold">{slide.title}</p>
        <p className="text-sm text-white/85">{slide.subtitle}</p>
      </div>
    </>
  )
}
