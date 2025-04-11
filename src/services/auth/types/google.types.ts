export type GoogleIdTokenPayload = {
  iss: string;
  azp: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: string | boolean; // Google sometimes returns it as a string
  at_hash?: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  iat: string; // Unix timestamp (seconds)
  exp: string; // Unix timestamp (seconds)
  alg?: string;
  kid?: string;
  typ?: string;
};
