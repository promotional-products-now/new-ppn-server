import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AnalyticsDto } from './dto/analytics.dto';
import { Order, OrderDocument } from 'src/order/schemas/order.schema';

@Injectable()
export class OrderAnalyticsService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
  ) {}

  async getOrderAnalyticsLineChart(orderAnalyticsDto: AnalyticsDto) {
    const from = new Date(orderAnalyticsDto.startDate);
    const to = new Date(orderAnalyticsDto.endDate);

    const orderAnalytics = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: from, $lte: to },
        },
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            status: '$status',
          },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.date': 1 },
      },
      {
        $project: {
          _id: 0,
          createdAt: '$_id.date',
          orderType: '$_id.status',
          totalOrder: '$totalOrders',
        },
      },
    ]);

    return orderAnalytics;
  }

  async getOrderAnalytics(orderAnalyticsDto: AnalyticsDto) {
    const from = new Date(orderAnalyticsDto.startDate);
    const to = new Date(orderAnalyticsDto.endDate);

    const totalOrders = await this.orderModel.countDocuments({
      createdAt: { $gte: from, $lte: to },
    });

    const ordersByStatus = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: from, $lte: to },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1,
        },
      },
    ]);

    const orderAnalytics = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: from, $lte: to },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          success: {
            $sum: {
              $cond: [{ $eq: ['$status', 'success'] }, 1, 0],
            },
          },
          pending: {
            $sum: {
              $cond: [{ $eq: ['$status', 'pending'] }, 1, 0],
            },
          },
          canceled: {
            $sum: {
              $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0],
            },
          },
          failed: {
            $sum: {
              $cond: [{ $eq: ['$status', 'failed'] }, 1, 0],
            },
          },
          delivered: {
            $sum: {
              $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0],
            },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          // date: '$_id',
          success: 1,
          pending: 1,
          canceled: 1,
          failed: 1,
          delivered: 1,
          _id: 0,
        },
      },
    ]);

    const response = {
      date: {
        from: from.toISOString(),
        to: to.toISOString(),
      },
      ordersByStatus: ordersByStatus,
      total: totalOrders,
      analytics: orderAnalytics[0],
    };

    return response;
  }
}
