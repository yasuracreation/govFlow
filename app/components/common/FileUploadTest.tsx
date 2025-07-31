import React, { useState } from 'react';
import FileUpload from './FileUpload';
import { FieldDefinition } from '@/types';
import Card from './Card';
import Button from './Button';
import CustomAlert from './CustomAlert';

const FileUploadTest: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const [alert, setAlert] = useState<{ type: 'info'; message: string; show: boolean } | null>(null);

  const testFields: FieldDefinition[] = [
    {
      id: 'test_file_1',
      label: 'Test Document 1',
      name: 'testDocument1',
      type: 'file',
      required: true,
      placeholder: 'Upload a test document'
    },
    {
      id: 'test_file_2',
      label: 'Test Document 2',
      name: 'testDocument2',
      type: 'file',
      required: false,
      placeholder: 'Upload another test document'
    }
  ];

  const handleFilesChange = (files: Record<string, File>) => {
    console.log('Files changed:', files);
    setUploadedFiles(files);
  };

  const handleTestUpload = () => {
    setAlert({ type: 'info', message: `Uploaded ${Object.keys(uploadedFiles).length} files:\n${Object.entries(uploadedFiles).map(([name, file]) => `${name}: ${file.name}`).join('\n')}`, show: true });
  };

  return (
    <div>
      {alert && (
        <CustomAlert
          type={alert.type}
          message={alert.message}
          show={alert.show}
          onClose={() => setAlert(null)}
        />
      )}
      <Card>
        <h2 className="text-xl font-bold mb-4">File Upload Test</h2>
        <FileUpload
          fields={testFields}
          onFilesChange={handleFilesChange}
          readOnly={false}
        />
        <div className="mt-4">
          <Button onClick={handleTestUpload}>
            Test Upload
          </Button>
        </div>
        <div className="mt-4">
          <h3 className="font-semibold">Uploaded Files:</h3>
          <ul className="mt-2 space-y-1">
            {Object.entries(uploadedFiles).map(([name, file]) => (
              <li key={name} className="text-sm text-gray-600">
                {name}: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default FileUploadTest; 