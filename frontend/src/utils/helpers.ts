import { format, formatDistanceToNow } from 'date-fns'

export const formatDate = (date: string | Date, formatStr: string = 'MMM dd, yyyy') => {
  if (!date) return ''
  return format(new Date(date), formatStr)
}

export const formatTime = (time: string) => {
  if (!time) return ''
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}

export const formatDateTime = (date: string | Date) => {
  if (!date) return ''
  return format(new Date(date), 'MMM dd, yyyy hh:mm a')
}

export const timeAgo = (date: string | Date) => {
  if (!date) return ''
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export const getStatusColor = (status: string) => {
  const colors: { [key: string]: string } = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
    verified: 'bg-green-100 text-green-800',
    normal: 'bg-blue-100 text-blue-800',
    urgent: 'bg-orange-100 text-orange-800',
    emergency: 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePhone = (phone: string) => {
  const re = /^[0-9]{10}$/
  return re.test(phone)
}

export const calculateAge = (dob: string) => {
  if (!dob) return 0
  const birthDate = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

export const truncateText = (text: string, maxLength: number) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export const capitalizeFirst = (str: string) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const getInitials = (name: string) => {
  if (!name) return ''
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return parts[0].charAt(0) + parts[1].charAt(0)
  }
  return parts[0].charAt(0)
}

export const downloadFile = (url: string, filename: string) => {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const generateTimeSlots = (startTime: string = '09:00', endTime: string = '18:00', interval: number = 30) => {
  const slots = []
  const start = new Date(`2000-01-01 ${startTime}`)
  const end = new Date(`2000-01-01 ${endTime}`)
  
  while (start < end) {
    const hours = start.getHours().toString().padStart(2, '0')
    const minutes = start.getMinutes().toString().padStart(2, '0')
    slots.push(`${hours}:${minutes}`)
    start.setMinutes(start.getMinutes() + interval)
  }
  
  return slots
}