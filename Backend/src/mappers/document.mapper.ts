import { DocumentVM } from '../vms/document.vm';

export function toDocumentVM(doc: any): DocumentVM {
  return {
    id: doc.id,
    serviceRequestId: doc.serviceRequestId,
    fileName: doc.fileName,
    fileType: doc.fileType,
    url: doc.url,
    createdAt: doc.createdAt,
  };
} 