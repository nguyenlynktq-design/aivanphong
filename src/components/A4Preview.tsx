// Legacy A4Preview — replaced by DocumentPreview
// Re-exports DocumentPreview for backward compatibility
import { Document } from '../types';
import { DocumentPreview } from './DocumentPreview';

interface A4PreviewProps {
  data: Partial<Document>;
}

export default function A4Preview({ data }: A4PreviewProps) {
  return <DocumentPreview data={data} />;
}
