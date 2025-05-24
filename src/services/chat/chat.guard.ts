import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Logger } from "../../logger/logger.service";

@Injectable()
export class ChatGuard implements CanActivate {
  constructor(
    private readonly logger: Logger,
    private readonly reflector: Reflector,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    return new Promise((rs) => rs(false));
  }
}