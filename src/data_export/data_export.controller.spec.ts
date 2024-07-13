import { Test, TestingModule } from '@nestjs/testing';
import { DataExportController } from './data_export.controller';
import { DataExportService } from './user_data_export.service';

describe('DataExportController', () => {
  let controller: DataExportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataExportController],
      providers: [DataExportService],
    }).compile();

    controller = module.get<DataExportController>(DataExportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
