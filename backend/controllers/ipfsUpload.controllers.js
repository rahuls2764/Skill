// controllers/ipfsUpload.controller.js
import pinata from '../services/pinata.service.js';
import multer from 'multer';

const upload = multer(); // For parsing multipart/form-data (used in video, thumbnail uploads)

export const uploadCourseToIPFS = async (req, res) => {
  try {
    const {
      title,
      category,
      difficulty,
      price,
      duration,
      description,
      prerequisites,
      learningOutcomes,
      quiz
    } = JSON.parse(req.body.metadata); // frontend will send metadata as JSON string

    const files = req.files; // thumbnail and video

    const videoFile = files?.videoFile?.[0];
    const thumbnail = files?.thumbnail?.[0];

    const videoCid = videoFile ? await pinata.uploadFile(videoFile.buffer, videoFile.originalname) : '';
    const thumbnailCid = thumbnail ? await pinata.uploadFile(thumbnail.buffer, thumbnail.originalname) : '';

    const descriptionCid = await pinata.uploadText(description, `description_${Date.now()}.txt`);
    const prerequisitesCid = await pinata.uploadText(prerequisites.join('\n'), `prerequisites_${Date.now()}.txt`);
    const outcomesCid = await pinata.uploadText(learningOutcomes.join('\n'), `outcomes_${Date.now()}.txt`);
    const quizCid = await pinata.uploadJSON(quiz, `quiz_${Date.now()}.json`);

    const metadata = {
      title,
      category,
      difficulty,
      price,
      duration,
      videoCid,
      thumbnailCid,
      descriptionCid,
      prerequisitesCid,
      learningOutcomesCid: outcomesCid,
      quizCid
    };

    const metadataCid = await pinata.uploadJSON(metadata, `course_metadata_${Date.now()}.json`);
    return res.json({ metadataCid });
  } catch (err) {
    console.error('Upload course error:', err);
    res.status(500).json({ error: 'Failed to upload course content to IPFS' });
  }
};

export const uploadQuizResultToIPFS = async (req, res) => {
  try {
    const quizResult = req.body;
    const resultCid = await pinata.uploadJSON(quizResult, `quiz_result_${Date.now()}.json`);
    return res.json({ resultCid });
  } catch (err) {
    console.error('Upload quiz result error:', err);
    res.status(500).json({ error: 'Failed to upload quiz result to IPFS' });
  }
};

export const multerUpload = upload.fields([
  { name: 'videoFile', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]);
