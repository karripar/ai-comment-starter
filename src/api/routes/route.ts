import express from 'express';
import {body} from 'express-validator';
import {validate} from '../../middlewares';
import {commentPost} from '../controllers/commentController';
import {imageGenerate} from '../controllers/imageController';

const router = express.Router();

router.route('/comment').post(body('text').notEmpty().escape(), validate, commentPost);

router.route('/thumbnail').post(body('text').notEmpty().escape(), validate, imageGenerate);

export default router;
