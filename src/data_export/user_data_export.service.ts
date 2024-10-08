import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../user/schemas/user.schema';
import { Model } from 'mongoose';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';

@Injectable()
export class UserDataExportService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async exportUserData(response: Response) {
    try {
      const users = await this.userModel.find(
        {},
        { password: 0, otpSecret: 0, images: 0 },
      );

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('users');

      sheet.columns = [
        { header: 'Id', key: '_id', width: 25 },
        { header: 'Email', key: 'emailAddress', width: 25 },
        { header: 'Verified', key: 'isVerified', width: 25 },
        { header: 'First Name', key: 'firstName', width: 25 },
        { header: 'Last Name', key: 'lastName', width: 25 },
        { header: 'Status', key: 'status', width: 25 },
        { header: 'Role', key: 'role', width: 25 },
        { header: 'State', key: 'state', width: 25 },
        { header: 'Address', key: 'address', width: 25 },
        { header: 'City', key: 'city', width: 25 },
        { header: 'Country', key: 'country', width: 25 },
        { header: 'Time Zone', key: 'timeZone', width: 25 },
        { header: 'Postal Code', key: 'postalCode', width: 25 },
        { header: 'Created At', key: 'createdAt', width: 25 },
        { header: 'Updated At', key: 'updatedAt', width: 25 },
      ];

      users.forEach((user) => {
        sheet.addRow({
          _id: user._id.toString(),
          emailAddress: user.email.address,
          isVerified: user.email.isVerified,
          firstName: user.firstName,
          lastName: user.lastName,
          status: user.status,
          role: user.role,
          state: user.location ? user.location.state : null,
          address: user.location ? user.location.address : null,
          city: user.location ? user.location.city : null,
          country: user.location ? user.location.country : null,
          timeZone: user.location ? user.location.timeZone : null,
          postalCode: user.location ? user.location.postalCode : null,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        });
      });

      response.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      response.setHeader(
        'Content-Disposition',
        'attachment; filename=users.xlsx',
      );

      await workbook.xlsx.write(response);
      response.end(); // End the response
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
