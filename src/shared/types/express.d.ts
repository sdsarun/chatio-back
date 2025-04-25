declare namespace Express {

  interface Request {
    _requestId?: string;
    user?: import("../../services/graphql/models/user.model").User | null;
  }
}
