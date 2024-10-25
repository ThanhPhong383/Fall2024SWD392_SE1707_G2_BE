import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Ghi lại lỗi vào log
    this.logger.error(
      `Error: ${JSON.stringify(message)} | URL: ${request.url}`,
    );

    // Sử dụng httpAdapter để gửi phản hồi HTTP
    httpAdapter.reply(
      ctx.getResponse(),
      {
        statusCode: status,
        message,
        timestamp: new Date().toISOString(),
        path: request.url,
      },
      status,
    );
  }
}
