export default class ErrorResponse extends Error {
  statusCode: string;
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}
