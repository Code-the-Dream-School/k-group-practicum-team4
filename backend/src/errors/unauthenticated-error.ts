import { StatusCodes } from 'http-status-codes';
import { CustomAPIError } from './custom-api-error';

export class UnauthenticatedError extends CustomAPIError {
  public status: number;

  constructor(message: string) {
    super(message);
    this.status = StatusCodes.UNAUTHORIZED;

    Object.setPrototypeOf(this, UnauthenticatedError.prototype);
  }
}
