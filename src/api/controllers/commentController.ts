import {Request, Response, NextFunction} from 'express';
import CustomError from '../../classes/CustomError';
import fetchData from '../../lib/fetchData';
import { ChatCompletion } from 'openai/resources/index';

const commentPost = async (
  req: Request<{}, {}, {text: string}>,
  res: Response<{response: string}>,
  next: NextFunction
) => {
    try {
      // TODO: Generate a response to a Youtube comment
      const request = {
        messages: [
          {
            role: 'system',
            content: 'Olet keppihevosien harrastaja, joka vastaa kysymyksiin keppihevosista. Vastaa lyhyesti, ytimekkäästi ja töykeästi käyttäen kiroilua aina kun mahdollista.',
          },
          {
            role: 'user',
            content: req.body.text,
          }
        ],
        model: 'gpt-5-nano',
      }

      if (!process.env.OPENAI_API_URL) {
        next(new CustomError('Missing OPENAI_API_URL in .env', 500));
        return;
      }

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      };

      const response = await fetchData<ChatCompletion>(process.env.OPENAI_API_URL + '/v1/chat/completions', options);

      console.log(response.choices[0].message.content);

      if (!response.choices || response.choices.length === 0) {
        next(new CustomError('No response from AI', 500));
        return;
      }

      res.json({response: response.choices[0].message?.content || 'No response'});
    } catch (error) {
    next(error);
  }
};

export {commentPost};
