import express from 'express';
import {
  signup,
  login,
  getCurrentUser,
  getAllUsers,
  deleteUser,
  ref15
} from '../controllers/user.controller.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/ref15', ref15);
router.get('/me', auth, getCurrentUser);
router.get('/all', auth, getAllUsers);
router.delete('/:id', auth, deleteUser);

export default router;
