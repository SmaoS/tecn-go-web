import { vi } from 'vitest'

export interface MockPosition {
  latitude?: number
  longitude?: number
  accuracy?: number
}

export function installGeolocationMock(position: MockPosition = {}) {
  const coords = {
    latitude: position.latitude ?? 4.142,
    longitude: position.longitude ?? -73.626,
    accuracy: position.accuracy ?? 10,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
    toJSON: () => ({}),
  } satisfies GeolocationCoordinates
  const currentPosition = {
    coords,
    timestamp: Date.now(),
    toJSON: () => ({}),
  } satisfies GeolocationPosition
  const getCurrentPosition = vi.fn<Geolocation['getCurrentPosition']>((success) => success(currentPosition))
  const watchPosition = vi.fn<Geolocation['watchPosition']>((success) => {
    success(currentPosition)
    return 1
  })
  const clearWatch = vi.fn<Geolocation['clearWatch']>()
  const geolocation: Geolocation = { getCurrentPosition, watchPosition, clearWatch }

  Object.defineProperty(navigator, 'geolocation', {
    configurable: true,
    value: geolocation,
  })
  return { geolocation, currentPosition }
}

export function installObjectUrlMock() {
  const createObjectURL = vi.fn(() => 'blob:tecngo-test')
  const revokeObjectURL = vi.fn()
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    value: createObjectURL,
  })
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    value: revokeObjectURL,
  })
  return { createObjectURL, revokeObjectURL }
}

export function imageFileFixture(name = 'evidencia.jpg') {
  return new File(['tecngo-image'], name, { type: 'image/jpeg' })
}
