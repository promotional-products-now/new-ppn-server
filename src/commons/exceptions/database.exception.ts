import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';

export class DatabaseException extends HttpException {
  // ---

  readonly description?;

  constructor(
    readonly cause: unknown,
    className?: string,
  ) {
    // ---

    const opts: HttpExceptionOptions = {
      cause,
      description: `Originated from ${className} object`,
    };

    super(
      "[io] We messed up on our end. We are working to fix this. You don't have to do anything just try again.",
      HttpStatus.INTERNAL_SERVER_ERROR,
      opts,
    );

    this.cause = cause;

    this.description = opts.description;
  }
}
