import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  BannerSetting,
  BannerSettingDocument,
} from './schemas/banner-setting.schema';
import { Model, UpdateQuery } from 'mongoose';
import { ProfitSetting } from './schemas/profit-setting.schema';
import { UpdateProfitSettingDto } from './dto/update-profit-setting.dto';
import { Freight } from './schemas/freight.schema';
import { FetchFreightQueryDto } from './dto/fetch-freight-query.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(BannerSetting.name)
    private readonly bannerSettingModel: Model<BannerSetting>,
    @InjectModel(ProfitSetting.name)
    private readonly profitSettingModel: Model<ProfitSetting>,
    @InjectModel(Freight.name)
    private readonly freightModel: Model<Freight>,
  ) {
    void this.initSetting();
  }

  private async initSetting() {
    const profitSetting = await this.profitSettingModel.findOne({});

    if (!profitSetting) {
      await this.profitSettingModel.create({
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
      });
    }

    const bannerSetting = await this.bannerSettingModel.findOne({});

    if (!bannerSetting) {
      await this.bannerSettingModel.create({
        banner: {
          isActive: false,
          message: '',
        },
        popupModal: {
          isActive: false,
          image: '',
          message: '',
          urlLink: '',
          position: '',
        },
      });
    }
  }

  async getProfitSetting() {
    return await this.profitSettingModel.findOne({});
  }

  async getBannerSetting() {
    return await this.bannerSettingModel.findOne({});
  }

  async updateBannerSetting(payload: UpdateQuery<BannerSettingDocument>) {
    return await this.bannerSettingModel.findOneAndUpdate({}, payload, {
      new: true,
    });
  }

  async updateProfitSetting(payload: UpdateProfitSettingDto) {
    return await this.profitSettingModel.findOneAndUpdate({}, payload, {
      new: true,
    });
  }

  async fetchFreights(query: FetchFreightQueryDto) {
    const { page, limit, query: search } = query;

    let payload: Record<string, any> = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      payload.$or = [
        { 'vendor.firstName': regex },
        { 'vendor.lastName': regex },
      ];
    }

    const freights = await this.freightModel
      .find(payload)
      .skip(limit * (page - 1))
      .limit(limit)
      .populate(['vendor'])
      .sort({ createdAt: -1 });

    const count = await this.freightModel.countDocuments(payload);
    const totalPages = Math.ceil(count / limit);

    return {
      docs: freights,
      page,
      limit,
      totalItems: count,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }
}
