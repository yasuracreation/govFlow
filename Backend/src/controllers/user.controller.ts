import { Request, Response } from 'express';
import users from '../data/mockUsers.json';

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 *           enum: [FRONT_DESK, OFFICER, SECTION_HEAD, DEPARTMENT_HEAD, ADMIN]
 *         subject:
 *           type: string
 *     UpdateRoleRequest:
 *       type: object
 *       required:
 *         - role
 *         - subject
 *       properties:
 *         role:
 *           type: string
 *           enum: [FRONT_DESK, OFFICER, SECTION_HEAD, DEPARTMENT_HEAD, ADMIN]
 *         subject:
 *           type: string
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
export const userController = {
  getAll: (req: Request, res: Response) => {
    res.json(users);
  },

  /**
   * @swagger
   * /api/users/{id}:
   *   get:
   *     summary: Get user by ID
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: User ID
   *     responses:
   *       200:
   *         description: User found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       404:
   *         description: User not found
   */
  getById: (req: Request, res: Response) => {
    const user = (users as any[]).find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  },

  update: (req: Request, res: Response) => {
    const { id } = req.params;
    const user = (users as any[]).find(u => u.id === id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    // Update allowed fields
    const allowedFields = ['name', 'email', 'officeId', 'officeName', 'subjectIds', 'nic', 'employeeId', 'role', 'status', 'lastLogin'];
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        user[key] = req.body[key];
      }
    }
    res.json(user);
  },

  /**
   * @swagger
   * /api/users/{id}/role:
   *   put:
   *     summary: Update user role and subject (Admin only)
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: User ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateRoleRequest'
   *     responses:
   *       200:
   *         description: User role updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 user:
   *                   $ref: '#/components/schemas/User'
   *       404:
   *         description: User not found
   *       403:
   *         description: Forbidden - Admin access required
   */
  updateRole: (req: Request, res: Response) => {
    const { id } = req.params;
    const { role, subject } = req.body;
    const user = (users as any[]).find(u => u.id === id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.role = role;
    user.subject = subject;
    res.json({ message: 'User role/subject updated', user });
  },
};