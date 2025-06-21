// routes/ipfsUpload.js
import express from 'express';
import {
  uploadCourseToIPFS,
  uploadQuizResultToIPFS,
  multerUpload
} from '../controllers/ipfsUpload.controllers.js';

const router = express.Router();

router.post('/course', multerUpload, uploadCourseToIPFS);
router.post('/quiz-result', uploadQuizResultToIPFS);

export default router;
