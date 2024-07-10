import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  LoggerService,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Response, Request } from 'express';
import { HttpDefaultResponse } from '../dtos/http-response.dto';
import { DatabaseException } from '../exceptions/database.exception';
import { MongoError } from 'mongodb';
import { JsonWebTokenError } from 'jsonwebtoken';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly logger: LoggerService,
  ) {}

  private isJavascriptError(error: any): boolean {
    return (
      error instanceof ReferenceError ||
      error instanceof TypeError ||
      error instanceof URIError ||
      error instanceof RangeError ||
      error instanceof SyntaxError
    );
  }

  private isCriticalError(error: unknown): boolean {
    return (
      error instanceof DatabaseException ||
      error instanceof MongoError ||
      error instanceof InternalServerErrorException
    );
  }

  private logCriticalError(error: unknown): void {
    if (error instanceof DatabaseException) {
      this.logger.error(error.cause, { description: error.description });
    } else if (error instanceof InternalServerErrorException) {
      this.logger.error(error.message);
    } else {
      this.logger.error(error);
    }
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const path = httpAdapter.getRequestUrl(request);

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    const responseBody: HttpDefaultResponse = {
      description: `Error occurred at ${path}. See logger for more details.`,
      message: 'We messed up on our end.',
      context: String(HttpStatus[httpStatus])?.toString() ?? 'server_error',
      isError: true,
      payload: null,
    };

    if (exception instanceof JsonWebTokenError) {
      httpStatus = HttpStatus.UNAUTHORIZED;
      responseBody.message = path.includes('/verify')
        ? 'Invalid verification credentials. Try again'
        : 'Your session has expired. Try logging in again';
      responseBody.context = String(
        HttpStatus[HttpStatus.UNAUTHORIZED],
      ).toLowerCase();
    }

    this.logCriticalError(exception);

    if (this.isCriticalError(exception)) {
      const msg =
        exception instanceof HttpException
          ? exception.message
          : 'There was an error from our end. Try again later';

      responseBody.message = msg;
      responseBody.description = `${msg} - ${responseBody.description}`;
    }

    if (this.isJavascriptError(exception)) {
      responseBody.message =
        'We messed up on our end. We are working to resolve this issue. Try again later.';
      responseBody.description = `[lang-error] ${responseBody.description}`;
      responseBody.context = 'server_error';
    }

    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      responseBody.context = String(HttpStatus[httpStatus]).toLowerCase();
      responseBody.message = exception.message;
    }

    response.status(httpStatus).json(responseBody);
  }
}
