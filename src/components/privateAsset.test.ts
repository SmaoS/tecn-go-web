import { api } from '../lib/api'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { openPrivateAsset, requiresAuthentication } from './privateAsset'

vi.mock('../lib/api', () => ({
  api: { get: vi.fn() },
}))

describe('requiresAuthentication', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    Object.defineProperty(window, 'open', { value: vi.fn(), configurable: true })
    Object.defineProperty(URL, 'createObjectURL', {
      value: vi.fn(() => 'blob:private-asset'),
      configurable: true,
    })
    Object.defineProperty(URL, 'revokeObjectURL', { value: vi.fn(), configurable: true })
  })

  it.each(['/v1/files/private-token', '/files/private-token'])(
    'protege assets privados %s',
    (url) => expect(requiresAuthentication(url)).toBe(true),
  )

  it('no intercepta recursos públicos externos', () => {
    expect(requiresAuthentication('https://cdn.example.com/photo.jpg')).toBe(false)
  })

  it('abre directamente recursos públicos', async () => {
    await openPrivateAsset('https://cdn.example.com/photo.jpg')

    expect(window.open).toHaveBeenCalledWith(
      'https://cdn.example.com/photo.jpg',
      '_blank',
      'noopener,noreferrer',
    )
    expect(api.get).not.toHaveBeenCalled()
  })

  it('descarga assets privados con la sesión y revoca la URL temporal', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: new Blob(['private']) } as never)

    await openPrivateAsset('/v1/files/private-token')
    expect(api.get).toHaveBeenCalledWith('/v1/files/private-token', { responseType: 'blob' })
    expect(window.open).toHaveBeenCalledWith('blob:private-asset', '_blank', 'noopener,noreferrer')

    vi.runAllTimers()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:private-asset')
  })
})
