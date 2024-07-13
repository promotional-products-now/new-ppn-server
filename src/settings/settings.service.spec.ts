import { Test, TestingModule } from '@nestjs/testing';
import { SettingsService } from './settings.service';
import { getModelToken } from '@nestjs/mongoose';
import {
  BannerSetting,
  BannerSettingDocument,
} from './schemas/banner-setting.schema';
import {
  ProfitSetting,
  ProfitSettingDocument,
} from './schemas/profit-setting.schema';
import { Freight, FreightDocument } from './schemas/freight.schema';
import { Model } from 'mongoose';

describe('SettingsService', () => {
  let service: SettingsService;
  let bannerSetingModel: Model<BannerSettingDocument>;
  let profitSettingModel: Model<ProfitSettingDocument>;
  let freightModel: Model<FreightDocument>;

  const bannerMockSetting = {
    banner: {
      isActive: false,
      message: '',
    },
    popupModal: {
      isActive: false,
      image: '',
      message: '',
      urlLink: '',
      position: 'top-center',
    },
  };

  const profitMockSetting = {
    defaultProfitMarkup: {
      nonVip: 0,
      goldVip: 0,
      diamondVip: 0,
    },
    minimumProfit: {
      nonVip: 100,
      goldVip: 100,
      diamondVip: 100,
    },
  };

  const mockFreights = Array.of()

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        {
          provide: getModelToken(BannerSetting.name),
          useValue: { findOne: jest.fn().mockResolvedValue(bannerMockSetting) },
        },
        {
          provide: getModelToken(ProfitSetting.name),
          useValue: { findOne: jest.fn().mockResolvedValue(profitMockSetting) },
        },
        {
          provide: getModelToken(Freight.name),
          useValue: {
            find: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
            sort: jest.fn().mockReturnThis(),
            exec: jest.fn(),
            countDocuments: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
    bannerSetingModel = module.get<Model<BannerSettingDocument>>(
      getModelToken(BannerSetting.name),
    );
    profitSettingModel = module.get<Model<ProfitSettingDocument>>(
      getModelToken(ProfitSetting.name),
    );
    freightModel = module.get<Model<FreightDocument>>(
      getModelToken(Freight.name),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(profitSettingModel).toBeDefined();
    expect(bannerSetingModel).toBeDefined();
    expect(freightModel).toBeDefined();
  });

  describe('Banner Setting', () => {
    it('should fetch banner setting', async () => {
      const response = await service.getBannerSetting();
      expect(response).toStrictEqual(bannerMockSetting);
      expect(bannerSetingModel.findOne).toHaveBeenCalled();
    });
  });

  describe('Profit Setting', () => {
    it('should fetch profit setting', async () => {
      const response = await service.getProfitSetting();
      expect(response).toStrictEqual(profitMockSetting);
      expect(profitSettingModel.findOne).toHaveBeenCalled();
    });
  });

  describe('Freight Setting', () => {
    // it('should fetch freight setting', async () => {
    //   const query = { page: 1, limit: 15 };

    //   (
    //     freightModel
    //       .find({})
    //       .skip((query.page - 1) * query.limit)
    //       .limit(query.limit)
    //       .populate(['vendor'])
    //       .sort().exec as jest.Mock
    //   ).mockResolvedValue(mockFreights);

    //   jest
    //     .spyOn(freightModel, 'countDocuments')
    //     .mockResolvedValue(mockFreights.length);

    //   const response = await service.fetchFreights(query);

    //   expect(response).toBeDefined();
    //   // expect(response.docs.length));
    //   expect(response.hasPrevPage).toBeFalsy();
    //   expect(response.totalItems).toEqual(query.limit);
    //   expect(response.page).toEqual(query.page);
    //   expect(response.totalPages).toEqual(1);
    //   expect(freightModel.find).toHaveBeenCalled();
    //   expect(freightModel.countDocuments).toHaveBeenCalled();
    // });
  });
});
