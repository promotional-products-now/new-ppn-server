import { Type } from 'class-transformer';
import { ObjectId } from 'mongodb';

export class OperationsLog {
  readonly ops: string;

  @Type(() => ObjectId)
  readonly entityId: ObjectId;

  readonly owner: string;

  readonly by: string;

  readonly at: Date;

  constructor(arg: Required<OperationsLog>) {
    Object.assign(this, arg);
  }
}
