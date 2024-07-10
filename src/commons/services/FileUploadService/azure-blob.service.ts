import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BlobServiceClient,
  BlockBlobClient,
  ContainerClient,
} from '@azure/storage-blob';
// import { v4 as uuidv4 } from 'uuid';
import { AzureBlobStorage } from 'src/configs';

@Injectable()
export class AzureBlobService {
  private containerClient: ContainerClient;

  // constructor(private configService: ConfigService) {
  //   const { azure_storage_connection_string, azure_container_name } =
  //     this.configService.get<AzureBlobStorage>('storage');

  //   const blobServiceClient = BlobServiceClient.fromConnectionString(
  //     azure_storage_connection_string,
  //   );
  //   this.containerClient =
  //     blobServiceClient.getContainerClient(azure_container_name);
  // }

  // getBlobClient(imageName: string): BlockBlobClient {
  //   return this.containerClient.getBlockBlobClient(imageName);
  // }

  // async uploadImage(
  //   imageBuffer: Buffer,
  //   originalName: string,
  // ): Promise<string> {
  //   // const blobName = `ppn-app/${originalName}_${uuidv4()}`;
  //   const blobName = `ppn-app/${originalName}`;

  //   const blockBlobClient = this.getBlobClient(blobName);
  //   await blockBlobClient.uploadData(imageBuffer);

  //   return blockBlobClient.url;
  // }
}
