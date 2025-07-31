import React, { useState, useCallback, useRef } from 'react';
import { FieldDefinition } from '@/types';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';

interface FileUploadProps {
  fields: FieldDefinition[];
  onFilesChange: (files: Record<string, File>) => void;
  readOnly?: boolean;
}

interface UploadedFile {
  fieldId: string;
  file: File;
}

const FileUpload: React.FC<FileUploadProps> = ({ fields, onFilesChange, readOnly = false }) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  console.log('FileUpload component rendered with fields:', fields);

  const handleFileChange = useCallback((fieldId: string, files: FileList | null) => {
    console.log('File input changed for field:', fieldId, 'Files:', files);
    setError(null);
    
    if (!files || files.length === 0) {
      console.log('No files selected');
      return;
    }
    
    const file = files[0];
    
    // Validate file type
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/',
      'text/plain'
    ];
    
    const isValidType = validTypes.some(type => file.type.startsWith(type));
    if (!isValidType) {
      setError('Invalid file type. Please upload PDF, DOC, DOCX, Images, or TXT files.');
      return;
    }
    
    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 10MB.');
      return;
    }
    
    try {
      const newFile = { fieldId, file };
      const newFilesList = [
        ...uploadedFiles.filter(f => f.fieldId !== fieldId),
        newFile
      ];
      setUploadedFiles(newFilesList);

      const filesRecord = newFilesList.reduce((acc, curr) => {
        const field = fields.find(f => f.id === curr.fieldId);
        if (field) {
          acc[field.name] = curr.file;
        }
        return acc;
      }, {} as Record<string, File>);
      
      console.log('Updated files record:', filesRecord);
      onFilesChange(filesRecord);
    } catch (err) {
      console.error('Error processing file:', err);
      setError('Error processing file upload');
    }
  }, [uploadedFiles, fields, onFilesChange]);

  const removeFile = (fieldId: string) => {
    console.log('Removing file for field:', fieldId);
    try {
      const newFilesList = uploadedFiles.filter(f => f.fieldId !== fieldId);
      setUploadedFiles(newFilesList);
      
      // Clear the file input
      const fileInput = fileInputRefs.current[fieldId];
      if (fileInput) {
        fileInput.value = '';
      }
      
      const filesRecord = newFilesList.reduce((acc, curr) => {
        const field = fields.find(f => f.id === curr.fieldId);
        if (field) {
          acc[field.name] = curr.file;
        }
        return acc;
      }, {} as Record<string, File>);
      
      onFilesChange(filesRecord);
    } catch (err) {
      console.error('Error removing file:', err);
      setError('Error removing file');
    }
  };

  const handleFileInputClick = (fieldId: string) => {
    const fileInput = fileInputRefs.current[fieldId];
    if (fileInput && !readOnly) {
      fileInput.click();
    }
  };

  const FileUploadField: React.FC<{ field: FieldDefinition }> = ({ field }) => {
    const currentFile = uploadedFiles.find(f => f.fieldId === field.id);

    return (
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-gray-800">{field.label}</h4>
        {field.placeholder && <p className="text-sm text-gray-500 mb-2">{field.placeholder}</p>}
        
        {currentFile ? (
          <div className="mt-2 bg-gray-100 p-3 rounded-md flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileIcon className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">{currentFile.file.name}</span>
              <span className="text-xs text-gray-500">({(currentFile.file.size / 1024).toFixed(2)} KB)</span>
            </div>
            {!readOnly && (
              <button 
                onClick={() => removeFile(field.id)} 
                className="text-red-500 hover:text-red-700 p-1"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Upload area */}
            <div
              className={`p-6 border-2 border-dashed rounded-md cursor-pointer transition-colors
                ${readOnly ? 'bg-gray-100 cursor-not-allowed border-gray-300' : 'border-gray-300 hover:border-blue-400'}
              `}
              onClick={() => handleFileInputClick(field.id)}
            >
              <div className="flex flex-col items-center justify-center text-center">
                  <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-blue-600">Click to upload</span> or use the button below
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, Images, TXT (Max 10MB)</p>
                  {field.required && (
                    <p className="text-xs text-red-500 mt-1">* Required</p>
                  )}
              </div>
            </div>
            
            {/* File input */}
            <input
              ref={(el) => { fileInputRefs.current[field.id] = el; }}
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.txt"
              onChange={(e) => handleFileChange(field.id, e.target.files)}
              className="hidden"
              disabled={readOnly}
            />
            
            {/* Upload button */}
            <button
              type="button"
              onClick={() => handleFileInputClick(field.id)}
              disabled={readOnly}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Select File
            </button>
          </div>
        )}
      </div>
    );
  };

  const fileFields = fields.filter(field => field.type === 'file');

  if(fileFields.length === 0) {
    console.log('No file fields found in FileUpload component');
    return null;
  }

  console.log('Rendering FileUpload with fields:', fileFields);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 border-b pb-2">Required Documents</h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      {fileFields.map(field => (
        <FileUploadField key={field.id} field={field} />
      ))}
    </div>
  );
};

export default FileUpload; 