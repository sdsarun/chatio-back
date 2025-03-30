import { getModelToken } from '@nestjs/sequelize';
import { Test } from '@nestjs/testing';
import { User } from '../../database/models/user.model';
import { UserGender, UserRole } from '../master/master.constants';
import { MasterService } from '../master/master.service';
import { CreateUserIfNotExistsInput } from './dto/input/create-user-if-not-exists.input';
import { UserService } from './user.service';
import { GetUserArgs } from './dto/args/get-user.args';
import randomUniqueName from '../../shared/utils/generators/random-unique-name.generator';
import { Op } from 'sequelize';
import { UpdateUserArgs } from './dto/args/update-user.args';

jest.mock('../../shared/utils/generators/random-unique-name.generator', () => ({
  default: jest.fn()
}))

describe('UserService', () => {
  let userService: UserService;

  const mockUserModel: Partial<jest.Mocked<typeof User>> = {
    upsert: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn()
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

    it('should create user when role is GUEST and username is generated', async () => {
      const mockUserRoleResolve = {
        id: '26f3ee7c-511d-4a3a-8a5e-30b0af5ba63e',
        name: UserRole.GUEST,
      };

      const mockUserGenderResolve = {
        id: "99999999-511d-4a3a-8a5e-30b0af5ba63e",
        name: UserGender.MALE,
      };

      const mockUserCreatedResolve = {
        id: '12a7da36-22ec-4e1d-8fa4-73ba8a57a2de',
        username: 'mock-username-1234',
        aka: 'mock-username-1234',
        userRole: mockUserRoleResolve,
        userGender: mockUserGenderResolve,
      };

      const testCreateUserPayload: CreateUserIfNotExistsInput = {
        role: UserRole.GUEST,
        gender: UserGender.MALE,
        username: 'mock-username-1234',  // this username will be ignored for GUEST role
        aka: 'mock-username-1234',
      };

      (randomUniqueName as jest.Mock).mockReturnValue("mock-username-1234");
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
          username: 'mock-username-1234',  // GUEST role generates the username
          aka: 'mock-username-1234',  // aka is the same as username for GUEST role
          userRoleId: mockUserRoleResolve.id,
        }),
        expect.objectContaining({
          returning: true,
        }),
      );

      expect(mockGetUserFn).toHaveBeenCalledWith(expect.objectContaining({ userId: mockUserCreatedResolve.id }));
      expect(userCreated).toMatchObject(mockUserCreatedResolve);
    });

    it('should create user when role is REGISTERED and username and aka are used', async () => {
      const mockUserRoleResolve = {
        id: '26f3ee7c-511d-4a3a-8a5e-30b0af5ba63e',
        name: UserRole.REGISTERED,
      };

      const mockUserGenderResolve = {
        id: "99999999-511d-4a3a-8a5e-30b0af5ba63e",
        name: UserGender.MALE,
      };

      const mockUserCreatedResolve = {
        id: '12a7da36-22ec-4e1d-8fa4-73ba8a57a2de',
        username: 'mock-username-registered',
        aka: 'mock-aka-registered',
        userRole: mockUserRoleResolve,
        userGender: mockUserGenderResolve,
      };

      const testCreateUserPayload: CreateUserIfNotExistsInput = {
        role: UserRole.REGISTERED,
        gender: UserGender.MALE,
        username: 'mock-username-registered',
        aka: 'mock-aka-registered',
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
          username: 'mock-username-registered',  // Registered role uses the provided username
          aka: 'mock-aka-registered',  // aka is used for Registered role
          userRoleId: mockUserRoleResolve.id,
        }),
        expect.objectContaining({
          returning: true,
        }),
      );

      expect(mockGetUserFn).toHaveBeenCalledWith(expect.objectContaining({ userId: mockUserCreatedResolve.id }));
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
            [Op.and]: expect.arrayContaining([
              expect.objectContaining({ id: testGetUserPayload.userId }),
            ]),
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
            [Op.and]: expect.arrayContaining([
              expect.objectContaining({ id: testGetUserPayload.userId }),
            ]),
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

  describe('updateUser', () => {
    it('should return updated user when user exists', async () => {
      // arrange
      const testPayload: UpdateUserArgs = {
        id: '1234',
        updateUserData: {
          aka: 'Updated Name',
          gender: UserGender.MALE,
        },
      };

      const mockUserGenderResolve = {
        id: 'gender-id',
        name: 'Male',
      };

      const mockUpdatedUser = {
        id: '1234',
        username: 'testuser',
        aka: 'Updated Name',
        userGender: mockUserGenderResolve,
      };

      mockMasterService.findUserGenderByName?.mockResolvedValue(mockUserGenderResolve);
      mockUserModel.update?.mockResolvedValue([1]); // mock update success

      const mockGetUserFn = jest
        .spyOn(userService, 'getUser')
        .mockResolvedValue(mockUpdatedUser);

      // act
      const result = await userService.updateUser(testPayload);

      // assert
      expect(mockUserModel.update).toHaveBeenCalledWith(
        expect.objectContaining({
          aka: 'Updated Name',
          userGenderId: mockUserGenderResolve.id,
        }),
        expect.objectContaining({
          where: { id: testPayload.id },
        })
      );

      expect(result).toEqual(mockUpdatedUser);
    });

    it('should return null when user does not exist', async () => {
      // arrange
      const testPayload: UpdateUserArgs = {
        id: '1234',
        updateUserData: {
          aka: 'Updated Name',
          gender: UserGender.MALE,
        },
      };

      const mockUserGenderResolve = {
        id: 'gender-id',
        name: 'Male',
      };

      mockMasterService.findUserGenderByName?.mockResolvedValue(mockUserGenderResolve);
      mockUserModel.update?.mockResolvedValue([0]); // simulate no user updated

      // act
      const result = await userService.updateUser(testPayload);

      // assert
      expect(result).toBeNull();
    });

    it('should throw error if gender does not exist', async () => {
      // arrange
      const testPayload: any = {
        id: '1234',
        updateUserData: {
          aka: 'Updated Name',
          gender: 'InvalidGender',
        },
      };

      mockMasterService.findUserGenderByName?.mockResolvedValue(null); // no gender found

      // act / assert
      await expect(userService.updateUser(testPayload)).rejects.toThrowError('Gender does not exists.');
    });

    it('should update user without gender if not provided', async () => {
      // arrange
      const testPayload = {
        id: '1234',
        updateUserData: {
          aka: 'Updated Name',
        },
      };

      const mockUpdatedUser = {
        id: '1234',
        username: 'testuser',
        aka: 'Updated Name',
      };

      mockUserModel.update?.mockResolvedValue([1]); // simulate successful update

      const mockGetUserFn = jest
        .spyOn(userService, 'getUser')
        .mockResolvedValue(mockUpdatedUser);

      // act
      const result = await userService.updateUser(testPayload);

      // assert
      expect(mockUserModel.update).toHaveBeenCalledWith(
        expect.objectContaining({
          aka: 'Updated Name',
        }),
        expect.objectContaining({
          where: { id: testPayload.id },
        })
      );

      expect(result).toEqual(mockUpdatedUser);
    });

    it('should not update if payload is invalid', async () => {
      // arrange
      const testPayload = {} as any; // invalid payload

      // act / assert
      await expect(userService.updateUser(testPayload)).rejects.toThrowError();
    });
  });
});
