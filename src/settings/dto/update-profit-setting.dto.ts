import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class Profit {
  @ApiProperty()
  @IsNumber()
  nonVip: number;

  @ApiProperty()
  @IsNumber()
  goldVip: number;

  @ApiProperty()
  @IsNumber()
  diamondVip: number;
}

export class UpdateProfitSettingDto {
  @ApiProperty({ type: () => Profit })
  @ValidateNested()
  @Type(() => Profit)
  minimumProfit: Profit;

  @ApiProperty({ type: () => Profit })
  @ValidateNested()
  @Type(() => Profit)
  defaultProfitMarkup: Profit;
}
