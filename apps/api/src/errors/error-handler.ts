import { FastifyError, FastifyInstance } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from '@/errors/app-error';

export function registerErrorHandlers(app: FastifyInstance) {
  app.setErrorHandler((error: FastifyError | Error, _req, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        statusCode: error.statusCode,
        error: error.code,
        message: error.message,
        details: error.details,
      });
    }

    if (error instanceof ZodError) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'VALIDATION_ERROR',
        message: 'Invalid request',
        details: error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      });
    }

    const fastifyError = error as FastifyError;
    if (fastifyError.validation) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'VALIDATION_ERROR',
        message: fastifyError.message,
        details: fastifyError.validation,
      });
    }

    if (fastifyError.statusCode && fastifyError.statusCode < 500) {
      return reply.status(fastifyError.statusCode).send({
        statusCode: fastifyError.statusCode,
        error: fastifyError.code ?? 'REQUEST_ERROR',
        message: fastifyError.message,
      });
    }

    app.log.error(error);
    return reply.status(500).send({
      statusCode: 500,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong',
    });
  });

  app.setNotFoundHandler((_req, reply) =>
    reply.status(404).send({ statusCode: 404, error: 'NOT_FOUND', message: 'Route not found' }),
  );
}
