import { Injectable, OnModuleInit } from '@nestjs/common';
import algoliasearch, { SearchClient, SearchIndex } from 'algoliasearch';
import { ConfigService } from '@nestjs/config';
import { AlgoliaConfig } from '../../../configs';

@Injectable()
export class AlgoliaService implements OnModuleInit {
  private client: SearchClient;
  private index: SearchIndex;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const algoliaConfig = this.configService.get<AlgoliaConfig>('algolia');
    if (algoliaConfig) {
      this.client = algoliasearch(algoliaConfig.appId, algoliaConfig.apiKey);
      this.index = this.client.initIndex('products');
    } else {
      throw new Error('Algolia configuration not found');
    }
  }

  async addRecord(record: any) {
    record.objectID = record._id;

    return this.index.saveObject(record);
  }

  async updateRecord(record: any) {
    record.objectID = record._id;
    return this.index.partialUpdateObject(record);
  }

  async deleteRecord(objectID: string) {
    return this.index.deleteObject(objectID);
  }

  async search(query: string) {
    return this.index.search(query);
  }
}
