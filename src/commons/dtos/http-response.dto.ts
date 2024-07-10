import { ApiProperty } from '@nestjs/swagger';

interface BaseHttpResponse {
  isError: boolean;
  description: string;
  message: string;
  context: string;
  payload: any;
}

export class HttpBaseResponse implements BaseHttpResponse {
  // ---

  @ApiProperty({
    type: Boolean,
    description: 'Indicates if the request was successful or an error',
  })
  isError: boolean;

  @ApiProperty({
    type: String,
    description:
      'A details error message for developers. Will be an empty string in production',
  })
  description: string;

  @ApiProperty({ type: String })
  context: string;

  @ApiProperty({
    type: Boolean,
    description:
      'A friendly message for the user. In a error it gives the user information about the error and how to resolve the errors',
  })
  message: string;

  @ApiProperty({
    nullable: true,
    description:
      'A distionary that maps the body of the response to it coressponding values',
  })
  readonly payload: any;

  constructor(arg: Required<any>) {
    Object.assign(this, arg);
  }
}

export class HttpDefaultResponse extends HttpBaseResponse {
  constructor(arg: Required<HttpDefaultResponse>) {
    super(arg);

    Object.assign(this, arg);
  }
}
