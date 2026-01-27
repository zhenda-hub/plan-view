import express from 'express'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

// GET /api/projects - 获取所有项目
router.get('/', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        tasks: true
      }
    })
    res.json(projects)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' })
  }
})

// GET /api/projects/:id - 获取单个项目
router.get('/:id', async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        tasks: {
          orderBy: { startDate: 'asc' }
        }
      }
    })
    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }
    res.json(project)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project' })
  }
})

// POST /api/projects - 创建项目
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body

    const project = await prisma.project.create({
      data: {
        name,
        description
      }
    })
    res.status(201).json(project)
  } catch (error) {
    console.error('Error creating project:', error)
    res.status(500).json({ error: 'Failed to create project' })
  }
})

// PATCH /api/projects/:id - 更新项目
router.patch('/:id', async (req, res) => {
  try {
    const { name, description } = req.body

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: { name, description }
    })
    res.json(project)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project' })
  }
})

// DELETE /api/projects/:id - 删除项目
router.delete('/:id', async (req, res) => {
  try {
    await prisma.project.delete({
      where: { id: req.params.id }
    })
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' })
  }
})

export default router
