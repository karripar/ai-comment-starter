import {Request, Response, NextFunction} from 'express';
import CustomError from '../../classes/CustomError';
import fetchData from '../../lib/fetchData';
import fs from 'fs';
import https from 'https';
import path from 'path';

type ImageResponse = {
  created?: number;
  data: { url?: string; b64_json?: string }[];
};

const imageGenerate = async (
  req: Request<{}, {}, {text: string}>,
  res: Response<{url: string; file?: string}>,
  next: NextFunction
) => {
  try {
    if (!process.env.OPENAI_API_URL) {
      next(new CustomError('OPENAI_API_URL missing from .env', 500));
      return;
    }

    if (!req.body.text) {
      next(new CustomError('Text is required', 400));
      return;
    }

    const request = {
      model: 'dall-e-2',
      prompt: `Create a thumbnail image for the following video topic: "${req.body.text}" in a vibrant and engaging style. Make sure the image is eye-catching and relevant to the topic.`,
      size: '1024x1024',
      n: 1,
    };

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    };

    const response = await fetchData<ImageResponse>(
      process.env.OPENAI_API_URL + '/v1/images/generations',
      options
    );

    if (!response.data || response.data.length === 0 || !response.data[0].url) {
      next(new CustomError('No response from AI', 500));
      return;
    }

    const imageUrl = response.data[0].url;
    const imageName = `${Date.now()}.png`;
    const uploadPath = path.join(__dirname, '../../../uploads', imageName);

    // Make sure uploads folder exists
    if (!fs.existsSync(path.dirname(uploadPath))) {
      fs.mkdirSync(path.dirname(uploadPath), {recursive: true});
    }

    // Download image from URL
    const file = fs.createWriteStream(uploadPath);
    https.get(imageUrl, (downloadRes) => {
      downloadRes.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Image saved to ${uploadPath}`);

        // Return both the signed url and local file path
        res.json({
          url: imageUrl,
          file: `/uploads/${imageName}`, // serve via express.static
        });
      });
    }).on('error', (err) => {
      fs.unlinkSync(uploadPath);
      console.error('Error downloading image:', err.message);
      next(new CustomError('Error saving image', 500));
    });

  } catch (error) {
    next(error);
  }
};

export { imageGenerate };
