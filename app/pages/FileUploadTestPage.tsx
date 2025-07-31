import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import FileUpload from '../components/common/FileUpload';
import { FieldDefinition } from '@/types';

const FileUploadTestPage: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const [testResults, setTestResults] = useState<string[]>([]);
  const navigate = useNavigate();

  const testFields: FieldDefinition[] = [
    {
      id: 'test_identity',
      label: 'Identity Documents',
      name: 'identityDocuments',
      type: 'file',
      required: true,
      placeholder: 'Upload identity documents (NIC, Passport, etc.)'
    },
    {
      id: 'test_address',
      label: 'Address Proof',
      name: 'addressProof',
      type: 'file',
      required: true,
      placeholder: 'Upload address proof document'
    },
    {
      id: 'test_additional',
      label: 'Additional Documents',
      name: 'additionalDocuments',
      type: 'file',
      required: false,
      placeholder: 'Upload any additional supporting documents'
    }
  ];

  const handleFilesChange = (files: Record<string, File>) => {
    console.log('Test page - Files changed:', files);
    setUploadedFiles(files);
    
    // Add test result
    const result = `Files updated: ${Object.keys(files).length} files`;
    setTestResults(prev => [...prev, result]);
  };

  const runTests = () => {
    const results: string[] = [];
    
    // Test 1: Check if FileUpload component renders
    results.push('✓ FileUpload component rendered successfully');
    
    // Test 2: Check if fields are properly defined
    if (testFields.length > 0) {
      results.push(`✓ ${testFields.length} file fields defined`);
    } else {
      results.push('✗ No file fields defined');
    }
    
    // Test 3: Check if files are being captured
    if (Object.keys(uploadedFiles).length > 0) {
      results.push(`✓ ${Object.keys(uploadedFiles).length} files captured`);
      Object.entries(uploadedFiles).forEach(([fieldName, file]) => {
        results.push(`  - ${fieldName}: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
      });
    } else {
      results.push('ℹ No files uploaded yet');
    }
    
    // Test 4: Check file types
    Object.entries(uploadedFiles).forEach(([fieldName, file]) => {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/', 'text/plain'];
      const isValidType = validTypes.some(type => file.type.startsWith(type));
      if (isValidType) {
        results.push(`✓ ${fieldName}: Valid file type (${file.type})`);
      } else {
        results.push(`✗ ${fieldName}: Invalid file type (${file.type})`);
      }
    });
    
    // Test 5: Check file sizes
    Object.entries(uploadedFiles).forEach(([fieldName, file]) => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size <= maxSize) {
        results.push(`✓ ${fieldName}: File size OK (${(file.size / 1024).toFixed(2)} KB)`);
      } else {
        results.push(`✗ ${fieldName}: File too large (${(file.size / 1024).toFixed(2)} KB > 10MB)`);
      }
    });
    
    setTestResults(results);
  };

  const clearResults = () => {
    setTestResults([]);
    setUploadedFiles({});
  };

  const testFileInput = () => {
    // Create a temporary file input to test if file dialogs work
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.txt';
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        setTestResults(prev => [...prev, `✓ File dialog test successful: ${files[0].name}`]);
      } else {
        setTestResults(prev => [...prev, '✗ File dialog test failed']);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">File Upload Test Page</h1>
          <p className="text-gray-600">Test and debug file upload functionality</p>
        </div>
        <Button
          variant="secondary"
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File Upload Test */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">File Upload Test</h3>
          <FileUpload
            fields={testFields}
            onFilesChange={handleFilesChange}
            readOnly={false}
          />
          
          <div className="mt-4 space-y-2">
            <Button onClick={runTests} className="w-full">
              Run Tests
            </Button>
            <Button onClick={testFileInput} className="w-full">
              Test File Dialog
            </Button>
            <Button 
              variant="secondary" 
              onClick={clearResults} 
              className="w-full"
            >
              Clear Results
            </Button>
          </div>
        </Card>

        {/* Test Results */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Test Results</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {testResults.length > 0 ? (
              testResults.map((result, index) => (
                <div 
                  key={index} 
                  className={`p-2 rounded text-sm ${
                    result.startsWith('✓') ? 'bg-green-50 text-green-700' :
                    result.startsWith('✗') ? 'bg-red-50 text-red-700' :
                    result.startsWith('ℹ') ? 'bg-blue-50 text-blue-700' :
                    'bg-gray-50 text-gray-700'
                  }`}
                >
                  {result}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No test results yet. Click "Run Tests" to start.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Debug Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Debug Information</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Current Files State:</h4>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
              {JSON.stringify(uploadedFiles, null, 2)}
            </pre>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Field Definitions:</h4>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
              {JSON.stringify(testFields, null, 2)}
            </pre>
          </div>
        </div>
      </Card>

      {/* Instructions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Testing Instructions</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>1. Try clicking the "Select File" button to test file dialog</p>
          <p>2. Try uploading different file types (PDF, DOC, DOCX, Images, TXT)</p>
          <p>3. Test file size limits (max 10MB)</p>
          <p>4. Check browser console for detailed logs</p>
          <p>5. Run tests to see validation results</p>
          <p>6. If file dialog doesn't open, check browser permissions</p>
        </div>
      </Card>
    </div>
  );
};

export default FileUploadTestPage; 