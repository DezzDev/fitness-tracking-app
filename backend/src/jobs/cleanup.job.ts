import cron from 'node-cron';
import { refreshTokenRepository } from '@/repositories/refreshToken.repository';
import { userService } from '@/services/user.service';
import logger from '@/utils/logger';

export const startCleanupJobs = () => {
  // Ejecutar cada día a las 3:00 AM
  cron.schedule('0 3 * * *', async () => {
    try {
      logger.info('Starting token cleanup...');

      const deleted = await refreshTokenRepository.deleteExpired();

      logger.info(`Deleted ${deleted} expired tokens`);
    } catch (error) {
      logger.error('Cleanup job failed', { error });
    }
  });

  // Ejecutar cada 6 horas
  cron.schedule('0 */6 * * *', async () => {
    try {
      logger.info('Starting expired demo users cleanup...');

      const deleted = await userService.deleteExpiredDemoUsers();

      logger.info(`Deleted ${deleted} expired demo users`);
    } catch (error) {
      logger.error('Demo cleanup job failed', { error });
    }
  });

  logger.info('Cleanup jobs started');
};
