export type MessageStatus =
  | 'RECEIVED'
  | 'FILTERED'
  | 'TRANSFORMED'
  | 'SENT'
  | 'QUEUED'
  | 'ERROR'
  | 'PENDING';

export interface ConnectorMessage {
  messageId: number;
  metaDataId: number;
  channelId: string;
  channelName: string;
  connectorName: string;
  serverId: string;
  receivedDate: string;
  status: MessageStatus;
  sendAttempts?: number;
  sendDate?: string;
  responseDate?: string;
  processingError?: string;
  responseError?: string;
  metaDataMap?: Record<string, string>;
  // Content fields (only when fetched with includeContent=true)
  rawContent?: { content?: string; dataType?: string };
  transformedContent?: { content?: string; dataType?: string };
  encodedContent?: { content?: string; dataType?: string };
  sentContent?: { content?: string; dataType?: string };
  responseContent?: { content?: string; dataType?: string };
  responseTransformedContent?: { content?: string; dataType?: string };
}

export interface Message {
  messageId: number;
  serverId: string;
  channelId: string;
  channelName: string;
  receivedDate: string;
  processed: boolean;
  // connectorMessages là map: "0" = source, "1"+ = destinations
  connectorMessages: Record<string, ConnectorMessage>;
}

export interface MessageFilter {
  statuses?: MessageStatus[];
  startDate?: string;
  endDate?: string;
  textSearch?: string;
}
