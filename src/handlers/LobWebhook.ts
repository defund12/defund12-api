import { notifyUserOnLobWebhook } from "../emails";
import { Request, Response } from 'express';
const asyncHandler = require('express-async-handler')

const lobWebhook = asyncHandler(async (req: Request, res: Response) => {
  await notifyUserOnLobWebhook(req.body);
  return res.json({});
});

export default lobWebhook;
