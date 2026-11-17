import { useSyncExternalStore } from 'react'

/**
 * true cuando el viewport es más angosto que `breakpoint` (px).
 * Reemplaza las tres copias que vivían en Home, MyProfile y ParcelsList.
 */
export function useIsMobile(breakpoint = 768) {
  const query = `(max-width: ${breakpoint}px)`

  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query)
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

export default useIsMobile
