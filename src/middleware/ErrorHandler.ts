import ErrorResponse from "../ErrorResponse";
export default function errorHandler(err, req, res, next) {
  console.log(err);
  let error = { ...err };
  if (error.name === "CastError") {
    error = new ErrorResponse(`Incorrectly formatted Id`, 400);
  } else if (error.code == 11000) {
    error = new ErrorResponse(`Duplicate entry not allowed`, 400);
  } else if (error.name === "ValidatorError") {
    let message = Object.values(error.errors)
      .map((err: any) => err.message)
      .join(",");
    error = new ErrorResponse(message, 400);
  }
  return res
    .status(error.statusCode || 500)
    .json({ success: false, error: error.message });
}
