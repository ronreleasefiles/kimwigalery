'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

export interface QueueTask {
  id: string
  type: 'upload' | 'delete' | 'toggle-public' | 'move-folder'
  title: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress?: number
  error?: string
  createdAt: Date
  startedAt?: Date
  estimatedTimeRemaining?: number // seconds
  currentChunk?: number
  totalChunks?: number
  data?: any
  completedAt?: Date
}

interface QueueContextType {
  tasks: QueueTask[]
  addTask: (task: Omit<QueueTask, 'id' | 'createdAt' | 'status' | 'progress' | 'startedAt' | 'estimatedTimeRemaining' | 'currentChunk' | 'totalChunks' | 'completedAt'>) => string
  updateTask: (id: string, updates: Partial<QueueTask>) => void
  removeTask: (id: string) => void
  clearCompleted: () => void
  isProcessing: boolean
  totalTasks: number
  completedTasks: number
  failedTasks: number
}

const QueueContext = createContext<QueueContextType | undefined>(undefined)

export const useQueue = () => {
  const context = useContext(QueueContext)
  if (!context) {
    throw new Error('useQueue must be used within a QueueProvider')
  }
  return context
}

export const QueueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<QueueTask[]>([])

  const addTask = useCallback((taskData: Omit<QueueTask, 'id' | 'createdAt' | 'status' | 'progress'>) => {
    const id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newTask: QueueTask = {
      ...taskData,
      id,
      status: 'pending',
      progress: 0,
      createdAt: new Date()
    }

    setTasks(prev => [...prev, newTask])
    return id
  }, [])

  const updateTask = useCallback((id: string, updates: Partial<QueueTask>) => {
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { 
            ...task, 
            ...updates,
            completedAt: updates.status === 'completed' || updates.status === 'failed' 
              ? new Date() 
              : task.completedAt
          }
        : task
    ))
  }, [])

  const removeTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id))
  }, [])

  const clearCompleted = useCallback(() => {
    setTasks(prev => prev.filter(task => 
      task.status !== 'completed' && task.status !== 'failed'
    ))
  }, [])

  const isProcessing = tasks.some(task => task.status === 'processing')
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.status === 'completed').length
  const failedTasks = tasks.filter(task => task.status === 'failed').length

  const value: QueueContextType = {
    tasks,
    addTask,
    updateTask,
    removeTask,
    clearCompleted,
    isProcessing,
    totalTasks,
    completedTasks,
    failedTasks
  }

  return (
    <QueueContext.Provider value={value}>
      {children}
    </QueueContext.Provider>
  )
}
