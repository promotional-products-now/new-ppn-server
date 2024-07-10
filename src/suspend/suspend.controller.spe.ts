import { Test, TestingModule } from '@nestjs/testing';
import { SuspendController } from './suspend.controller';
import { SuspendService } from './suspend.service';

describe('SuspendController', () => {
  let controller: SuspendController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuspendController],
      providers: [SuspendService],
    }).compile();

    controller = module.get<SuspendController>(SuspendController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
