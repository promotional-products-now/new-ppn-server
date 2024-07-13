import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponse } from 'src/types';
import { Freight } from '../schemas/freight.schema';

export class PaginatedFreightSettingsResponse
  implements PaginatedResponse<Freight>
{
  @ApiProperty({ type: [Freight] })
  docs: Freight[];

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalItems: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  hasNextPage: boolean;

  @ApiProperty()
  hasPrevPage: boolean;
}
