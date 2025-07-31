import { Request, Response } from 'express';
import { TemplateService } from '../services/template.service';
import { toTemplateVM } from '../mappers/template.mapper';

// Create an instance of the service
const templateService = new TemplateService();

/**
 * @swagger
 * components:
 *   schemas:
 *     Template:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         content:
 *           type: string
 *         variables:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               description:
 *                 type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateTemplateRequest:
 *       type: object
 *       required:
 *         - name
 *         - content
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         content:
 *           type: string
 *         variables:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               description:
 *                 type: string
 */

/**
 * @swagger
 * /api/templates:
 *   get:
 *     summary: Get all templates
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of templates
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Template'
 */
export const templateController = {
  getAll: (req: Request, res: Response) => {
    const templates = templateService.getAll().map(toTemplateVM);
    res.json(templates);
  },

  /**
   * @swagger
   * /api/templates/{id}:
   *   get:
   *     summary: Get template by ID
   *     tags: [Templates]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Template ID
   *     responses:
   *       200:
   *         description: Template found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Template'
   *       404:
   *         description: Template not found
   */
  getById: (req: Request, res: Response) => {
    const template = templateService.getById(req.params.id);
    if (!template) return res.status(404).json({ message: 'Template not found' });
    res.json(toTemplateVM(template));
  },

  /**
   * @swagger
   * /api/templates:
   *   post:
   *     summary: Create new template
   *     tags: [Templates]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateTemplateRequest'
   *     responses:
   *       201:
   *         description: Template created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Template'
   */
  create: (req: Request, res: Response) => {
    const template = templateService.create(req.body);
    res.status(201).json(toTemplateVM(template));
  },

  /**
   * @swagger
   * /api/templates/{id}:
   *   put:
   *     summary: Update template
   *     tags: [Templates]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Template ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateTemplateRequest'
   *     responses:
   *       200:
   *         description: Template updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Template'
   *       404:
   *         description: Template not found
   */
  update: (req: Request, res: Response) => {
    const template = templateService.update(req.params.id, req.body);
    if (template === null || template === undefined) return res.status(404).json({ message: 'Template not found' });
    res.status(200).json(toTemplateVM(template));
  },

  /**
   * @swagger
   * /api/templates/{id}:
   *   delete:
   *     summary: Delete template
   *     tags: [Templates]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Template ID
   *     responses:
   *       204:
   *         description: Template deleted successfully
   *       404:
   *         description: Template not found
   */
  delete: (req: Request, res: Response) => {
    const success = templateService.delete(req.params.id);
    if (!success) return res.status(404).json({ message: 'Template not found' });
    res.status(204).send();
  },
}; 