import { Request, Response } from 'express';
import { OfficeService } from '../services/office.service';
import { toOfficeVM } from '../mappers/office.mapper';

const officeService = new OfficeService();

/**
 * @swagger
 * components:
 *   schemas:
 *     Office:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         code:
 *           type: string
 *         address:
 *           type: string
 *         phone:
 *           type: string
 *         email:
 *           type: string
 *         head:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateOfficeRequest:
 *       type: object
 *       required:
 *         - name
 *         - code
 *       properties:
 *         name:
 *           type: string
 *         code:
 *           type: string
 *         address:
 *           type: string
 *         phone:
 *           type: string
 *         email:
 *           type: string
 *         head:
 *           type: string
 */

/**
 * @swagger
 * /api/offices:
 *   get:
 *     summary: Get all offices
 *     tags: [Offices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of offices
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Office'
 */
export const officeController = {
  getAll: (req: Request, res: Response) => {
    const offices = officeService.getAll().map(toOfficeVM);
    res.json(offices);
  },

  /**
   * @swagger
   * /api/offices/{id}:
   *   get:
   *     summary: Get office by ID
   *     tags: [Offices]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Office ID
   *     responses:
   *       200:
   *         description: Office found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Office'
   *       404:
   *         description: Office not found
   */
  getById: (req: Request, res: Response) => {
    const office = officeService.getById(req.params.id);
    if (!office) return res.status(404).json({ message: 'Office not found' });
    res.json(toOfficeVM(office));
  },

  /**
   * @swagger
   * /api/offices:
   *   post:
   *     summary: Create new office
   *     tags: [Offices]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateOfficeRequest'
   *     responses:
   *       201:
   *         description: Office created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Office'
   */
  create: (req: Request, res: Response) => {
    const office = officeService.create(req.body);
    res.status(201).json(toOfficeVM(office));
  },

  /**
   * @swagger
   * /api/offices/{id}:
   *   put:
   *     summary: Update office
   *     tags: [Offices]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Office ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateOfficeRequest'
   *     responses:
   *       200:
   *         description: Office updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Office'
   *       404:
   *         description: Office not found
   */
  update: (req: Request, res: Response) => {
    const office = officeService.update(req.params.id, req.body);
    if (!office) return res.status(404).json({ message: 'Office not found' });
    res.json(toOfficeVM(office));
  },

  /**
   * @swagger
   * /api/offices/{id}:
   *   delete:
   *     summary: Delete office
   *     tags: [Offices]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Office ID
   *     responses:
   *       204:
   *         description: Office deleted successfully
   *       404:
   *         description: Office not found
   */
  delete: (req: Request, res: Response) => {
    const success = officeService.delete(req.params.id);
    if (!success) return res.status(404).json({ message: 'Office not found' });
    res.status(204).send();
  },
}; 