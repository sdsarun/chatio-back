export class VerifyGoogleIDTokenError extends Error {
  constructor(message: string = "Failed to verify Google ID Token") {
    super(message)
  }
}