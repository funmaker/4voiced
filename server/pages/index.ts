import os from 'os';
import PromiseRouter from "express-promise-router";
import { IndexPageResponse } from "../../types/api";

export const router = PromiseRouter();

router.use((req, res, next) => {
  res.setHeader('Cache-Control', 'max-age=0, no-store');
  
  next();
});

// Pages go here

router.get<never, IndexPageResponse>('/', async (req, res) => {
  const initialData = {
    kek: `Welcome to Boilerplate 3.0 on ${os.hostname()}!`,
  };
  
  res.react(initialData);
});

