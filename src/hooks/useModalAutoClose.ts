'use client'

import { useEffect } from 'react'
import { useQueue } from '@/contexts/QueueContext'

/**
 * Hook để tự động đóng modal khi có task mới được thêm vào queue
 */
export const useModalAutoClose = (
  isOpen: boolean,
  onClose: () => void,
  options?: {
    delay?: number // Delay trước khi đóng (ms)
    taskTypes?: string[] // Chỉ đóng với các loại task cụ thể
  }
) => {
  const { tasks } = useQueue()
  const { delay = 500, taskTypes } = options || {}

  useEffect(() => {
    if (!isOpen) return

    // Lấy task mới nhất
    const latestTask = tasks[tasks.length - 1]
    
    if (latestTask && (latestTask.status === 'pending' || latestTask.status === 'processing')) {
      // Kiểm tra loại task nếu được chỉ định
      if (taskTypes && !taskTypes.includes(latestTask.type)) {
        return
      }

      // Kiểm tra xem task này có phải mới được tạo không (trong vòng 1 giây)
      const taskAge = Date.now() - latestTask.createdAt.getTime()
      if (taskAge > 1000) return // Task cũ hơn 1 giây, không đóng modal

      // Đóng modal sau delay
      const timer = setTimeout(() => {
        onClose()
      }, delay)

      return () => clearTimeout(timer)
    }
  }, [tasks, isOpen, onClose, delay, taskTypes])
}
