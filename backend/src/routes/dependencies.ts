import express from 'express'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

// GET /api/dependencies - 获取所有依赖关系
router.get('/', async (req, res) => {
  try {
    const dependencies = await prisma.dependency.findMany()
    res.json(dependencies)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dependencies' })
  }
})

// POST /api/dependencies - 创建依赖关系
router.post('/', async (req, res) => {
  try {
    const { fromTaskId, toTaskId, type, lag } = req.body

    const dependency = await prisma.dependency.create({
      data: {
        fromTaskId,
        toTaskId,
        type: type || 'finish_to_start',
        lag: lag || 0
      }
    })
    res.status(201).json(dependency)
  } catch (error) {
    console.error('Error creating dependency:', error)
    res.status(500).json({ error: 'Failed to create dependency' })
  }
})

// DELETE /api/dependencies/:id - 删除依赖关系
router.delete('/:id', async (req, res) => {
  try {
    await prisma.dependency.delete({
      where: { id: req.params.id }
    })
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete dependency' })
  }
})

export default router
