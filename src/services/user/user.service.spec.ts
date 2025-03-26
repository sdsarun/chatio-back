import { getModelToken } from '@nestjs/sequelize';
import { Test } from '@nestjs/testing';
import { User } from '../../database/models/user.model';
import { UserGender, UserRole } from '../master/master.constants';
import { MasterService } from '../master/master.service';
import { CreateUserIfNotExistsInput } from './dto/input/create-user-if-not-exists.input';
import { UserService } from './user.service';
import { GetUserArgs } from './dto/args/get-user.args';

describe('UserService', () => {
  let userService: UserService;

  const mockUserModel: Partial<jest.Mocked<typeof User>> = {
    upsert: jest.fn(),
    findOne: jest.fn(),
  };

  const mockMasterService: Partial<jest.Mocked<MasterService>> = {
    findUserRoleById: jest.fn(),
    findUserRoleByName: jest.fn(),
    findUserGenderByName: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User),
          useValue: mockUserModel,
        },
        {
          provide: MasterService,
          useValue: mockMasterService,
        },
      ],
    }).compile();

    userService = module.get(UserService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should defined', () => {
    expect(userService).toBeDefined();
  });

  describe('createUserIfNotExists', () => {

    // this function validate input already, not testing payload missing
    it('create user when valid payload', async () => {
      // arrange
      const testCreateUserPayload: CreateUserIfNotExistsInput = {
        role: UserRole.GUEST,
        gender: UserGender.MALE,
        username: 'mockusername',
      };

      const mockUserRoleResolve = {
        id: '26f3ee7c-511d-4a3a-8a5e-30b0af5ba63e',
        name: UserRole.GUEST,
      };

      const mockUserGenderResolve = {
        id: "99999999-511d-4a3a-8a5e-30b0af5ba63e",
        name: UserGender.MALE
      }

      const mockUserCreatedResolve = {
        id: '12a7da36-22ec-4e1d-8fa4-73ba8a57a2de',
        username: 'mockusername',
        aka: 'mockusername',
        userRole: mockUserRoleResolve,
        userGender: mockUserGenderResolve,
      };

      mockMasterService.findUserRoleByName?.mockResolvedValue(mockUserRoleResolve);
      mockMasterService.findUserGenderByName?.mockResolvedValue(mockUserGenderResolve);
      mockUserModel.upsert?.mockResolvedValue([mockUserCreatedResolve as any, true]);

      const mockGetUserFn = jest
        .spyOn(userService, 'getUser')
        .mockResolvedValue(mockUserCreatedResolve);

      // act
      const userCreated = await userService.createUserIfNotExists(testCreateUserPayload);

      // assert
      expect(mockUserModel.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          username: testCreateUserPayload.username,
          aka: testCreateUserPayload.username,
          userRoleId: mockUserRoleResolve.id,
        }),
        expect.objectContaining({
          returning: true,
        }),
      );

      expect(mockGetUserFn).toHaveBeenCalledWith(expect.objectContaining({ userId: mockUserCreatedResolve.id }),);
      expect(userCreated).toMatchObject(mockUserCreatedResolve);
    });

    it('throw error when invalid payload', () => {
      const mockUserRoleResolve = {
        id: '26f3ee7c-511d-4a3a-8a5e-30b0af5ba63e',
        name: UserRole.GUEST,
      };

      const mockUserCreatedResolve = {
        id: '12a7da36-22ec-4e1d-8fa4-73ba8a57a2de',
        username: 'mockusername',
        aka: 'mockusername',
        userRole: mockUserRoleResolve,
      };

      mockMasterService.findUserRoleByName?.mockResolvedValue(mockUserRoleResolve);
      mockUserModel.upsert?.mockResolvedValue([mockUserCreatedResolve as any, true,]);

      jest
        .spyOn(userService, 'getUser')
        .mockResolvedValue(mockUserCreatedResolve);


      // act
      // assert
      expect(userService.createUserIfNotExists({} as any, { validateDTO: true })).rejects.toThrow(Error);
      expect(userService.createUserIfNotExists({ role: "" } as any, { validateDTO: true })).rejects.toThrow(Error);
      expect(userService.createUserIfNotExists(undefined as any, { validateDTO: true })).rejects.toThrow(Error);
      expect(userService.createUserIfNotExists(null as any, { validateDTO: true })).rejects.toThrow(Error);
    });
  });

  describe('getUser', () => {
    it("return user data when found", async () => {
      // arrange
      const testGetUserPayload: GetUserArgs = {
        userId: "9fbad616-e3f7-466a-8043-2c199f6ed1a7"
      }

      const mockUserRoleResolve = {
        id: '26f3ee7c-511d-4a3a-8a5e-30b0af5ba63e',
        name: UserRole.GUEST,
      };

      const mockUserFindOneResolve = {
        id: '12a7da36-22ec-4e1d-8fa4-73ba8a57a2de',
        username: 'mockusername',
        aka: 'mockusername',
        userRole: mockUserRoleResolve,
      };

      mockUserModel.findOne?.mockResolvedValue(mockUserFindOneResolve as any);

      // act
      const findOneUserResult = await userService.getUser(testGetUserPayload);

      // assert
      expect(findOneUserResult).not.toBeNull();
      expect(mockUserModel.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: testGetUserPayload.userId
          }),
          raw: true,
          include: expect.objectContaining({ all: true }),
          nest: true,
        })
      )
    });

    it("return null when not found", async () => {
      // arrange
      const testGetUserPayload: GetUserArgs = {
        userId: "9fbad616-e3f7-466a-8043-2c199f6ed1a7"
      }

      mockUserModel.findOne?.mockResolvedValue(null);

      // act
      const findOneUserResult = await userService.getUser(testGetUserPayload);

      // assert
      expect(findOneUserResult).toBeNull();
      expect(mockUserModel.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: testGetUserPayload.userId
          }),
          raw: true,
          include: expect.objectContaining({ all: true }),
          nest: true,
        })
      )
    });

    it('throw error when invalid payload', () => {
      expect(userService.getUser({}, { validateDTO: true })).rejects.toThrow(Error);
      expect(userService.getUser(undefined as any, { validateDTO: true }),).rejects.toThrow(Error);
      expect(userService.getUser(null as any, { validateDTO: true }),).rejects.toThrow(Error);
    });
  });
});
