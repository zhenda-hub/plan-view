import express from 'express'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

// GET /api/tasks - 获取所有任务
router.get('/', async (req, res) => {
  try {
    const { projectId } = req.query
    const where = projectId ? { projectId: String(projectId) } : {}

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { startDate: 'asc' }
    })
    res.json(tasks)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' })
  }
})

// GET /api/tasks/:id - 获取单个任务
router.get('/:id', async (req, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id }
    })
    if (!task) {
      return res.status(404).json({ error: 'Task not found' })
    }
    res.json(task)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch task' })
  }
})

// POST /api/tasks - 创建任务
router.post('/', async (req, res) => {
  try {
    const { title, description, startDate, endDate, level, color, status, progress, type, priority, assignedTo, dependencies, parentId, projectId } = req.body

    const task = await prisma.task.create({
      data: {
        title,
        description,
        startDate: startDate instanceof Date ? startDate : new Date(startDate),
        endDate: endDate instanceof Date ? endDate : new Date(endDate),
        level,
        color,
        status,
        progress: progress || 0,
        type: type || 'task',
        priority,
        assignedTo: assignedTo ? JSON.stringify(assignedTo) : undefined,
        dependencies: dependencies || [],
        parentId,
        projectId
      }
    })
    res.status(201).json(task)
  } catch (error) {
    console.error('Error creating task:', error)
    res.status(500).json({ error: 'Failed to create task', details: error.message })
  }
})

// PATCH /api/tasks/:id - 更新任务
router.patch('/:id', async (req, res) => {
  try {
    const { title, description, startDate, endDate, level, color, status, progress, type, priority, assignedTo, dependencies } = req.body

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (startDate !== undefined) updateData.startDate = startDate instanceof Date ? startDate : new Date(startDate)
    if (endDate !== undefined) updateData.endDate = endDate instanceof Date ? endDate : new Date(endDate)
    if (level !== undefined) updateData.level = level
    if (color !== undefined) updateData.color = color
    if (status !== undefined) updateData.status = status
    if (progress !== undefined) updateData.progress = progress
    if (type !== undefined) updateData.type = type
    if (priority !== undefined) updateData.priority = priority
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo ? JSON.stringify(assignedTo) : null
    if (dependencies !== undefined) updateData.dependencies = dependencies

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: updateData
    })
    res.json(task)
  } catch (error) {
    console.error('Error updating task:', error)
    res.status(500).json({ error: 'Failed to update task', details: error.message })
  }
})

// DELETE /api/tasks/:id - 删除任务
router.delete('/:id', async (req, res) => {
  try {
    await prisma.task.delete({
      where: { id: req.params.id }
    })
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' })
  }
})

export default router
