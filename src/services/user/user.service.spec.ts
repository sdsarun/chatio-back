import { Test } from '@nestjs/testing';
import { UserService } from './user.service';

describe('UserService', () => {
  let UserService: UserService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    UserService = module.get(UserService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should defined', () => {
    expect(UserService).toBeDefined();
  });
});
