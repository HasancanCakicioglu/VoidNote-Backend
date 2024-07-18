import express from 'express';
import { home } from '../controllers/main.controller.js';


const router = express.Router();

router.get('/home',home);

export default router;