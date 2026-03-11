export interface ConnectorProperties {
  [key: string]: unknown;
}

export interface Connector {
  metaDataId: number;
  name: string;
  transportName: string;
  mode: 'SOURCE' | 'DESTINATION';
  enabled: boolean;
  properties?: ConnectorProperties;
  waitForPrevious?: boolean;
}

export interface ChannelProperties {
  clearGlobalChannelMap: boolean;
  messageStorageMode: string;
  encryptAttachments: boolean;
  encryptCustomMetaData?: boolean;
  removeContentOnCompletion?: boolean;
  removeAttachmentsOnCompletion?: boolean;
  initialState: 'STARTED' | 'STOPPED' | 'PAUSED';
  storeAttachments: boolean;
  encryptMessageContent?: boolean;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  revision: number;
  sourceConnector: Connector;
  destinationConnectors: Connector[];
  properties: ChannelProperties;
  enabledDestinationConnectors?: number[];
}
