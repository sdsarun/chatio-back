import { Test } from "@nestjs/testing";
import { ChatService } from "./chat.service";

describe('ChatService', () => {
  let chatService: ChatService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ChatService]
    }).compile();

    chatService = module.get(ChatService);
  });

  it('should defined', () => {
    expect(chatService).toBeDefined();
  });
});
