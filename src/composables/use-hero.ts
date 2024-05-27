import { type Ref, computed, nextTick, unref, useAttrs } from 'vue'
import { tryOnBeforeUnmount, tryOnMounted, useElementBounding } from '@vueuse/core'
import { useElementTransform, useMotion } from '@vueuse/motion'
import { defu } from 'defu'
import omit from 'lodash.omit'
import type { HeroProps } from '../components/hero'
import { useHeroContext } from '../composables/use-hero-context'
import type { Transition } from '../types'

export type UseHeroProps = Omit<HeroProps, 'as'>

export const defaultTransition = {
  type: 'spring',
  stiffness: 600,
  damping: 35,
}

export function useHero(domRef: Ref<any>, props: UseHeroProps) {
  let motionInstance: any

  const attrs = useAttrs()
  const bounding: Record<string, number> = { x: 0, y: 0, width: 0, height: 0 }
  const { layouts, props: ctxProps } = useHeroContext()
  const curr = useElementBounding(domRef)

  const style = computed(() => attrs?.style ?? {})
  const transition = computed(() => defu(props.transition ?? {}, ctxProps.transition ?? {}, defaultTransition))

  const prev = computed({
    get() {
      if (!props.layoutId)
        return {}
      return layouts.value[props.layoutId] ?? {}
    },
    set(value) {
      if (!props.layoutId)
        return
      layouts.value[props.layoutId] = value
    },
  })

  tryOnMounted(async () => {
    bounding.x = curr.x.value
    bounding.y = curr.y.value
    bounding.width = curr.width.value
    bounding.height = curr.height.value

    let _y = 0
    if (prev.value.y)
      _y = prev.value.y - bounding.y

    let _x = 0
    if (prev.value.x)
      _x = prev.value.x - bounding.x

    await nextTick()

    const initial = { ...unref(prev), x: `${_x}px`, y: `${_y}px`, width: prev.value.width, height: prev.value.height }
    const enter = { ...style.value, x: 0, y: 0, width: bounding.width, height: bounding.height, transition: unref(transition) }

    motionInstance = useMotion(domRef, {
      initial: omit(initial, props.ignore),
      enter: omit(enter, props.ignore) as Transition,
    })
  })

  tryOnBeforeUnmount(() => {
    const { transform } = useElementTransform(domRef)
    bounding.x += transform.x as number
    bounding.y += transform.y as number
    bounding.z += transform.z as number
    const motionProperties = motionInstance ? motionInstance.motionProperties : style.value
    prev.value = { ...motionProperties, ...bounding }
  })

  return { bounding }
}
