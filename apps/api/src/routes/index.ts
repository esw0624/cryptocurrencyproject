import { Router } from 'express';

import { assetsRouter } from './assets';
import { historyRouter } from './history';
import { modelsRouter } from './models';
import { predictionsRouter } from './predictions';

export const apiRouter = Router();

apiRouter.use('/api', assetsRouter);
apiRouter.use('/api', historyRouter);
apiRouter.use('/api', predictionsRouter);
apiRouter.use('/api', modelsRouter);
