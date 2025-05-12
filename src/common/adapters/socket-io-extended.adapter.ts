import { INestApplicationContext } from "@nestjs/common";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { Server, ServerOptions } from "socket.io";
import { ConfigurationService } from "../../configuration/configuration.service";
import { AuthService } from "../../services/auth/auth.service";
import { UserRole } from "../../services/master/master.constants";
import { Logger } from "../../logger/logger.service";

export class SocketIOExtendedAdapter extends IoAdapter {
  constructor(
    private readonly services: {
      app: INestApplicationContext;
      configurationService: ConfigurationService;
      authService: AuthService;
      logger: Logger;
    }
  ) {
    super(services.app);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const newPort = port;
    const newOptions: Partial<ServerOptions> = {
      ...options,
      cors: {
        ...this.services.configurationService.corsConfig,
      },
    }

    const server = super.createIOServer(newPort, newOptions) as Server;

    server.use((socket, next) => {
      this.services.authService
        .authorize({
          isPublic: false,
          accessToken: socket.handshake.auth?.accessToken || socket.handshake.auth?.token || socket.handshake.headers?.["token"],
          roles: Object.values(UserRole) // required all roles
        })
        .then(({ user, error }) => {
          socket["user"] = user;
          next(error ? error : undefined)
        });
    })

    return server;
  }
}