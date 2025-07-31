import { Request, Response } from 'express';
import users from '../data/mockUsers.json';
import { signToken } from '../utils/jwt';

let resetTokens: { [email: string]: string } = {};

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User email
 *         password:
 *           type: string
 *           description: User password
 *     LoginResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT token
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - role
 *         - subject
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *         role:
 *           type: string
 *           enum: [FRONT_DESK, OFFICER, SECTION_HEAD, DEPARTMENT_HEAD, ADMIN]
 *         subject:
 *           type: string
 *     ForgotPasswordRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *     ResetPasswordRequest:
 *       type: object
 *       required:
 *         - email
 *         - token
 *         - newPassword
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         token:
 *           type: string
 */

export class AuthController {
  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     summary: User login
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LoginRequest'
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/LoginResponse'
   *       401:
   *         description: Invalid credentials
   */
  static login(req: Request, res: Response) {
    // Accept identifier (can be email, employeeId, or name) and password
    const { identifier, password } = req.body;
    const user = (users as any[]).find(u =>
      (u.email === identifier || u.employeeId === identifier || u.name === identifier) &&
      u.password === password
    );
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signToken({ id: user.id, role: user.role, email: user.email });
    res.json({ token });
  }

  /**
   * @swagger
   * /api/auth/me:
   *   get:
   *     summary: Get current user info
   *     tags: [Authentication]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Current user information
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                 email:
   *                   type: string
   *                 role:
   *                   type: string
   *                 name:
   *                   type: string
   *       401:
   *         description: Unauthorized
   */
  static me(req: Request, res: Response) {
    const jwtUser = (req as any).user;
    // Find the complete user data from mock users
    const user = (users as any[]).find(u => u.id === jwtUser.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Return complete user data (excluding password)
    const { password, ...userData } = user;
    res.json(userData);
  }

  /**
   * @swagger
   * /api/auth/register:
   *   post:
   *     summary: Register new user (Admin only)
   *     tags: [Authentication]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RegisterRequest'
   *     responses:
   *       201:
   *         description: User created successfully
   *       400:
   *         description: User already exists
   *       403:
   *         description: Forbidden - Admin access required
   */
  static register(req: Request, res: Response) {
    const { email, password, role, subject } = req.body;
    if ((users as any[]).find(u => u.email === email)) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const newUser = {
      id: ((users as any[]).length + 1).toString(),
      email,
      password,
      role,
      subject,
    };
    (users as any[]).push(newUser);
    res.status(201).json({ message: 'User created', user: newUser });
  }

  /**
   * @swagger
   * /api/auth/forgot-password:
   *   post:
   *     summary: Request password reset
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ForgotPasswordRequest'
   *     responses:
   *       200:
   *         description: Reset token generated
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 token:
   *                   type: string
   *       404:
   *         description: User not found
   */
  static forgotPassword(req: Request, res: Response) {
    const { email } = req.body;
    const user = (users as any[]).find(u => u.email === email);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const token = Math.random().toString(36).substring(2, 15);
    resetTokens[email] = token;
    res.json({ message: 'Reset token generated', token });
  }

  /**
   * @swagger
   * /api/auth/reset-password:
   *   post:
   *     summary: Reset password with token
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ResetPasswordRequest'
   *     responses:
   *       200:
   *         description: Password reset successful
   *       400:
   *         description: Invalid token
   *       404:
   *         description: User not found
   */
  static resetPassword(req: Request, res: Response) {
    const { email, token, newPassword } = req.body;
    if (resetTokens[email] !== token) return res.status(400).json({ error: 'Invalid token' });
    const user = (users as any[]).find(u => u.email === email);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.password = newPassword;
    delete resetTokens[email];
    res.json({ message: 'Password reset successful' });
  }

  /**
   * @swagger
   * /api/auth/logout:
   *   post:
   *     summary: User logout
   *     tags: [Authentication]
   *     responses:
   *       200:
   *         description: Logout successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   */
  static logout(req: Request, res: Response) {
    res.json({ message: 'Logged out' });
  }
} 