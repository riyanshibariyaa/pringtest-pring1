"use client"
import { X, Bell, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

interface NotificationProps {
  id: string
  type: "success" | "error" | "warning" | "info"
  title: string
  message: string
  timestamp: Date
  read: boolean
  onMarkAsRead: (id: string) => void
  onDismiss: (id: string) => void
}

const NotificationItem = ({
  id,
  type,
  title,
  message,
  timestamp,
  read,
  onMarkAsRead,
  onDismiss,
}: NotificationProps) => {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200"
      case "error":
        return "bg-red-50 border-red-200"
      case "warning":
        return "bg-yellow-50 border-yellow-200"
      case "info":
        return "bg-blue-50 border-blue-200"
    }
  }

  return (
    <div
      className={cn(
        "p-4 border rounded-lg transition-all duration-300 hover:shadow-md",
        getBgColor(),
        !read && "ring-2 ring-brand-blue ring-opacity-50",
        "animate-slide-up",
      )}
    >
      <div className="flex items-start space-x-3">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className={cn("text-sm font-semibold", !read && "font-bold")}>{title}</h4>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                {timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
              <Button variant="ghost" size="sm" onClick={() => onDismiss(id)} className="h-6 w-6 p-0 hover:bg-gray-200">
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-1">{message}</p>
          {!read && (
            <Button
              variant="link"
              size="sm"
              onClick={() => onMarkAsRead(id)}
              className="p-0 h-auto text-xs text-brand-blue"
            >
              Mark as read
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

interface NotificationCenterProps {
  notifications: Array<{
    id: string
    type: "success" | "error" | "warning" | "info"
    title: string
    message: string
    timestamp: Date
    read: boolean
  }>
  onMarkAsRead: (id: string) => void
  onDismiss: (id: string) => void
  onMarkAllAsRead: () => void
  onClearAll: () => void
}

const NotificationCenter = ({
  notifications,
  onMarkAsRead,
  onDismiss,
  onMarkAllAsRead,
  onClearAll,
}: NotificationCenterProps) => {
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-brand-blue" />
          <h3 className="text-lg font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-brand-blue text-white text-xs px-2 py-1 rounded-full">{unreadCount}</span>
          )}
        </div>
        <div className="flex space-x-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={onMarkAllAsRead}>
              Mark all read
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onClearAll}>
            Clear all
          </Button>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No notifications</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              {...notification}
              onMarkAsRead={onMarkAsRead}
              onDismiss={onDismiss}
            />
          ))
        )}
      </div>
    </div>
  )
}

export { NotificationCenter, NotificationItem }
