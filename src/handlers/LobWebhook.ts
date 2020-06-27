import { notifyUserOnLobWebhook } from "../emails";
import { Request, Response } from "express";
import asyncHandler = require("express-async-handler");

const lobWebhook = asyncHandler(async (req: Request, res: Response) => {
  await notifyUserOnLobWebhook(req.body);
  return res.json({});
});

export default lobWebhook;
