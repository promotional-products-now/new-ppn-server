import { Test, TestingModule } from '@nestjs/testing';
import { SuspendService } from './suspend.service';

describe('SuspendService', () => {
  let service: SuspendService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SuspendService],
    }).compile();

    service = module.get<SuspendService>(SuspendService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
