import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '../../../test/renderWithProviders'
import { server } from '../../../test/server'
import { TechnicianWalletPage } from './TechnicianWalletPage'

const wallet = {
  technicianId: 'technician-1',
  technicianName: 'Técnico TecnGo',
  technicianEmail: 'tecnico@tecngo.test',
  balance: 25_000,
  currency: 'COP',
  rechargeEnabled: true,
  lowBalance: false,
  blocked: false,
  lowBalanceMinimum: 10_000,
  minRechargeAmount: 10_000,
  maxRechargeAmount: 500_000,
  totalApprovedRecharges: 50_000,
  totalCommissionDebits: 25_000,
  completedServicesCount: 4,
}

describe('TechnicianWalletPage', () => {
  it('muestra movimientos y crea una recarga Wompi', async () => {
    let rechargeAmount = 0
    vi.spyOn(window, 'open').mockImplementation(() => null)
    server.use(
      http.get('*/v1/technicians/me/wallet', () => HttpResponse.json(wallet)),
      http.get('*/v1/technicians/me/wallet/transactions', () => HttpResponse.json([{
        id: 'transaction-1',
        type: 'RECHARGE_APPROVED',
        amount: 25_000,
        balanceBefore: 0,
        balanceAfter: 25_000,
        description: 'Recarga de prueba',
        createdAt: '2026-06-22T12:00:00Z',
      }])),
      http.post('*/v1/technicians/me/wallet/recharge', async ({ request }) => {
        rechargeAmount = ((await request.json()) as { amount: number }).amount
        return HttpResponse.json({
          rechargeId: 'recharge-1',
          paymentUrl: 'https://checkout.wompi.test/recharge-1',
          reference: 'TECGO-1',
          amount: rechargeAmount,
          currency: 'COP',
        })
      }),
    )
    const { user } = renderWithProviders(<TechnicianWalletPage />)

    await screen.findByText('$25.000')
    await user.click(screen.getByRole('button', { name: 'Ver historial' }))
    expect(screen.getByText('Recarga aprobada')).toBeInTheDocument()
    const amount = screen.getByRole('textbox', { name: 'Valor a recargar' })
    await user.clear(amount)
    await user.type(amount, '30000')
    await user.click(screen.getByRole('button', { name: 'Recargar con Wompi' }))

    await waitFor(() => expect(rechargeAmount).toBe(30_000))
    expect(window.open).toHaveBeenCalledWith(
      'https://checkout.wompi.test/recharge-1', '_blank', 'noopener,noreferrer',
    )
  })
})
