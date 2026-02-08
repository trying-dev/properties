'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'

import Header from '+/components/Header'
import Footer from '+/components/Footer'
import {
  getTenantNotificationsAction,
  markNotificationReadAction,
  type TenantNotificationItem,
} from '+/actions/notifications'

type NotificationTypeKey = 'GENERAL' | 'APPROVAL' | 'REJECTION' | 'PAYMENT_OVERDUE' | 'REMINDER'

const notificationTypeOptions: Array<{ value: NotificationTypeKey; label: string }> = [
  { value: 'GENERAL', label: 'General' },
  { value: 'APPROVAL', label: 'Aprobación' },
  { value: 'REJECTION', label: 'Denegación' },
  { value: 'PAYMENT_OVERDUE', label: 'Pago vencido' },
  { value: 'REMINDER', label: 'Recordatorio' },
]

const notificationTypeStyles: Record<NotificationTypeKey, string> = {
  GENERAL: 'bg-gray-100 text-gray-700',
  APPROVAL: 'bg-emerald-100 text-emerald-700',
  REJECTION: 'bg-red-100 text-red-700',
  PAYMENT_OVERDUE: 'bg-amber-100 text-amber-700',
  REMINDER: 'bg-blue-100 text-blue-700',
}

const formatDateTime = (value: string | Date) => {
  const date = new Date(value)
  return date.toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })
}

const getSenderLabel = (notification: TenantNotificationItem) => {
  if (notification.senderRole === 'SYSTEM') return 'Sistema'
  if (notification.senderRole === 'ADMIN') {
    const adminName = `${notification.admin?.user?.name ?? ''} ${notification.admin?.user?.lastName ?? ''}`.trim()
    return adminName || 'Administración'
  }
  return 'Tú'
}

const getTitle = (notification: TenantNotificationItem) => notification.title?.trim() || getSenderLabel(notification)

export default function TenantNotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<TenantNotificationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const unreadCount = useMemo(() => notifications.filter((notification) => !notification.readAt).length, [notifications])

  useEffect(() => {
    let isMounted = true
    const loadNotifications = async () => {
      setIsLoading(true)
      const result = await getTenantNotificationsAction()
      if (!isMounted) return
      if (result.success && result.data) {
        setNotifications(result.data)
      } else {
        setNotifications([])
      }
      setIsLoading(false)
    }

    void loadNotifications()
    return () => {
      isMounted = false
    }
  }, [])

  const handleMarkRead = async (notificationId: string) => {
    const result = await markNotificationReadAction(notificationId)
    if (!result.success) return
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId ? { ...notification, readAt: notification.readAt ?? new Date() } : notification
      )
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="mb-6 flex items-center justify-between">
          <button onClick={() => router.push('/dashboard/tenant')} className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Cargando notificaciones...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-gray-600">Tienes {unreadCount} notificación(es) sin leer.</p>
            </div>

            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">
                  <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No hay notificaciones todavía.</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`rounded-xl border px-4 py-3 ${
                      notification.readAt ? 'border-gray-200 bg-white' : 'border-blue-200 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{getTitle(notification)}</p>
                        <p className="text-xs text-gray-500">{formatDateTime(notification.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            notificationTypeStyles[notification.type as NotificationTypeKey]
                          }`}
                        >
                          {notificationTypeOptions.find((option) => option.value === notification.type)?.label ?? 'General'}
                        </span>
                        {!notification.readAt && (
                          <button
                            type="button"
                            onClick={() => handleMarkRead(notification.id)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                          >
                            Marcar leída
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mt-2">{notification.body}</p>
                    {notification.link && (
                      <a href={notification.link} className="text-xs text-blue-600 hover:text-blue-700 mt-2 inline-block">
                        Ver detalle
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
