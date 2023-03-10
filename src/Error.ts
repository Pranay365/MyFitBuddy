export class ApplicationError extends Error {
  code: number;
  message: string = "";
  constructor(message: string, code: number) {
    super(message);
    this.code = code;
  }
}
