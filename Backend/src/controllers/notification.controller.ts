import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: string
 *         title:
 *           type: string
 *         message:
 *           type: string
 *         read:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *     CreateNotificationRequest:
 *       type: object
 *       required:
 *         - userId
 *         - title
 *         - message
 *       properties:
 *         userId:
 *           type: string
 *         title:
 *           type: string
 *         message:
 *           type: string
 *         read:
 *           type: boolean
 *           default: false
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get all notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 */
export const notificationController = {
  getAll: (req: Request, res: Response) => {
    res.json(NotificationService.getAll());
  },

  /**
   * @swagger
   * /api/notifications/{id}:
   *   get:
   *     summary: Get notification by ID
   *     tags: [Notifications]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Notification ID
   *     responses:
   *       200:
   *         description: Notification found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Notification'
   *       404:
   *         description: Notification not found
   */
  getById: (req: Request, res: Response) => {
    const notification = NotificationService.getById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json(notification);
  },

  /**
   * @swagger
   * /api/notifications:
   *   post:
   *     summary: Create new notification
   *     tags: [Notifications]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateNotificationRequest'
   *     responses:
   *       201:
   *         description: Notification created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Notification'
   */
  create: (req: Request, res: Response) => {
    const notification = NotificationService.create(req.body);
    res.status(201).json(notification);
  },

  /**
   * @swagger
   * /api/notifications/{id}:
   *   put:
   *     summary: Update notification
   *     tags: [Notifications]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Notification ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *               message:
   *                 type: string
   *               read:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Notification updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Notification'
   *       404:
   *         description: Notification not found
   */
  update: (req: Request, res: Response) => {
    const notification = NotificationService.update(req.params.id, req.body);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json(notification);
  },

  /**
   * @swagger
   * /api/notifications/{id}:
   *   delete:
   *     summary: Delete notification
   *     tags: [Notifications]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Notification ID
   *     responses:
   *       204:
   *         description: Notification deleted successfully
   *       404:
   *         description: Notification not found
   */
  delete: (req: Request, res: Response) => {
    const success = NotificationService.delete(req.params.id);
    if (!success) return res.status(404).json({ message: 'Notification not found' });
    res.status(204).send();
  },
}; 