import { StatusCodes } from 'http-status-codes';
import { CustomAPIError } from './custom-api-error';

export class BadRequestError extends CustomAPIError {
  public status: number;

  constructor(message: string) {
    super(message);
    this.status = StatusCodes.BAD_REQUEST;

    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}
