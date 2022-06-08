import express from 'express';

const router = express.Router();

router.use(express.json());

router.post('/login', loginOrCreate);
