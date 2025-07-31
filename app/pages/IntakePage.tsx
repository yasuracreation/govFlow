import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import Textarea from '../components/common/Textarea';
import FileUpload from '../components/common/FileUpload';
import { Subject, ServiceRequest, FieldDefinition, UploadedDocument } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import CustomAlert from '../components/common/CustomAlert';
import { getSubjects } from '../services/subjectService';
import { getWorkflows } from '../services/workflowService';
import serviceRequestService from '../services/serviceRequestService';

const IntakePage: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const [formData, setFormData] = useState({
    nicNumber: '',
    citizenName: '',
    citizenAddress: '',
    citizenContact: '',
    subjectId: '',
    preferredDateTime: '',
    documentsPresent: false,
    additionalNotes: ''
  });
  const [loading, setLoading] = useState(false);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string; show: boolean } | null>(null);
  const [workflows, setWorkflows] = useState<any[]>([]);

  useEffect(() => {
    const fetchSubjectsAndWorkflows = async () => {
      try {
        setSubjectsLoading(true);
        const [fetchedSubjects, fetchedWorkflows] = await Promise.all([
          getSubjects(),
          getWorkflows()
        ]);
        setSubjects(fetchedSubjects);
        setWorkflows(fetchedWorkflows);
      } catch (error) {
        console.error('Error fetching subjects or workflows:', error);
        setAlert({ type: 'error', message: 'Failed to load subjects or workflows. Please try again.', show: true });
      } finally {
        setSubjectsLoading(false);
      }
    };
    fetchSubjectsAndWorkflows();
  }, []);

  const handleFilesChange = (files: Record<string, File>) => {
    console.log('Files changed in intake:', files);
    setUploadedFiles(files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('formData.subjectId:', formData.subjectId);
      if (!formData.subjectId) {
        setAlert({ type: 'error', message: 'Please select a subject before proceeding.', show: true });
        setLoading(false);
        return;
      }
      const selectedSubject = subjects.find(s => String(s.id) === (formData.subjectId));
      if (!selectedSubject) {
        setAlert({ type: 'error', message: 'Selected subject not found. Please try again.', show: true });
        setLoading(false);
        return;
      }
      const workflowName = selectedSubject.name + ' Workflow';
      console.log('Selected subject:', selectedSubject);
      console.log('Workflow name to search:', workflowName);
      console.log('All subject names:', subjects.map(s => s.name));
      console.log('All workflow names:', workflows.map(wf => wf.name));
      // Case-insensitive, trimmed match
      const relevantWorkflow = workflows.find((wf: any) => Number(wf.subjectId) === Number(selectedSubject.id));
      console.log('Found workflow:', relevantWorkflow);

      if (!relevantWorkflow) {
        setAlert({ type: 'error', message: 'No workflow found for the selected subject. Please configure one in the Workflow Studio.', show: true });
        setLoading(false);
        return;
      }
      if (!relevantWorkflow.steps || relevantWorkflow.steps.length === 0) {
        setAlert({ type: 'error', message: 'The workflow for this subject has no steps defined. Please configure steps in the Workflow Studio.', show: true });
        setLoading(false);
        return;
      }

      // Convert uploaded files to UploadedDocument format
      const documents: UploadedDocument[] = Object.entries(uploadedFiles).map(([fieldName, file]) => ({
        id: `doc_${Date.now()}_${fieldName}`,
        name: file.name,
        url: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'front-desk-user-id'
      }));
      
      const newServiceRequest: ServiceRequest = {
        id: uuidv4(),
        serviceRequestData: {
          nicNumber: formData.nicNumber,
          citizenName: formData.citizenName,
          citizenAddress: formData.citizenAddress,
          citizenContact: formData.citizenContact,
          subjectId: formData.subjectId,
          preferredDateTime: formData.preferredDateTime,
          initialDocumentsPresent: formData.documentsPresent,
          additionalNotes: formData.additionalNotes,
        },
        status: 'New',
        currentStepId: relevantWorkflow.steps[0]?.id || '',
        workflowDefinitionId: relevantWorkflow.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: [
          {
            stepId: 'intake',
            stepName: 'Request Intake',
            userId: 'front-desk-user-id', 
            userName: 'Front Desk Officer',
            timestamp: new Date().toISOString(),
            action: 'Submitted',
            data: formData,
            documents: documents
          }
        ],
      };

      // (TODO: Replace with API call to create service request)
      await serviceRequestService.createServiceRequest(newServiceRequest);
      setAlert({ type: 'success', message: 'Service request created successfully!', show: true });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting request:', error);
      setAlert({ type: 'error', message: 'Failed to create service request.', show: true });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const allowedSubjects = subjects.filter(subject => {
    return workflows.some((wf: any) => Number(wf.subjectId) === Number(subject.id));
  });

  // Define file upload fields for intake
  const getIntakeFileFields = (): FieldDefinition[] => {
    if (!formData.subjectId) return [];
    
    // Subject-specific document requirements
    const subjectDocumentMap: Record<string, FieldDefinition[]> = {
      'sub_business_registration': [
        {
          id: 'intake_business_plan',
          label: 'Business Plan',
          name: 'businessPlan',
          type: 'file',
          required: true,
          placeholder: 'Upload business plan document'
        },
        {
          id: 'intake_identity_docs',
          label: 'Identity Documents',
          name: 'identityDocuments',
          type: 'file',
          required: true,
          placeholder: 'Upload identity documents (NIC, Passport, etc.)'
        },
        {
          id: 'intake_address_proof',
          label: 'Address Proof',
          name: 'addressProof',
          type: 'file',
          required: true,
          placeholder: 'Upload address proof document'
        },
        {
          id: 'intake_tax_clearance',
          label: 'Tax Clearance Certificate',
          name: 'taxClearance',
          type: 'file',
          required: true,
          placeholder: 'Upload tax clearance certificate'
        },
        {
          id: 'intake_additional_docs',
          label: 'Additional Documents',
          name: 'additionalDocuments',
          type: 'file',
          required: false,
          placeholder: 'Upload any additional supporting documents'
        }
      ],
      'sub_license_renewal': [
        {
          id: 'intake_current_license',
          label: 'Current License',
          name: 'currentLicense',
          type: 'file',
          required: true,
          placeholder: 'Upload current license document'
        },
        {
          id: 'intake_identity_docs',
          label: 'Identity Documents',
          name: 'identityDocuments',
          type: 'file',
          required: true,
          placeholder: 'Upload identity documents (NIC, Passport, etc.)'
        },
        {
          id: 'intake_address_proof',
          label: 'Address Proof',
          name: 'addressProof',
          type: 'file',
          required: true,
          placeholder: 'Upload address proof document'
        },
        {
          id: 'intake_compliance_cert',
          label: 'Compliance Certificate',
          name: 'complianceCertificate',
          type: 'file',
          required: true,
          placeholder: 'Upload compliance certificate'
        },
        {
          id: 'intake_additional_docs',
          label: 'Additional Documents',
          name: 'additionalDocuments',
          type: 'file',
          required: false,
          placeholder: 'Upload any additional supporting documents'
        }
      ],
      'sub_new_request': [
        {
          id: 'intake_identity_docs',
          label: 'Identity Documents',
          name: 'identityDocuments',
          type: 'file',
          required: true,
          placeholder: 'Upload identity documents (NIC, Passport, etc.)'
        },
        {
          id: 'intake_address_proof',
          label: 'Address Proof',
          name: 'addressProof',
          type: 'file',
          required: true,
          placeholder: 'Upload address proof document'
        },
        {
          id: 'intake_additional_docs',
          label: 'Additional Documents',
          name: 'additionalDocuments',
          type: 'file',
          required: false,
          placeholder: 'Upload any additional supporting documents'
        }
      ]
    };
    
    return subjectDocumentMap[formData.subjectId] || [];
  };

  const intakeFileFields = getIntakeFileFields();

  return (
    <div className="space-y-6">
      {alert && (
        <CustomAlert
          type={alert.type}
          message={alert.message}
          show={alert.show}
          onClose={() => setAlert(null)}
        />
      )}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          {t('intake.title')}
        </h1>
        <p className="text-gray-600">
          {t('intake.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Citizen Information */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t('intake.citizenInfo')}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('intake.nicNumber')}
                </label>
                <Input
                  value={formData.nicNumber}
                  onChange={(e) => handleInputChange('nicNumber', e.target.value)}
                  placeholder={t('intake.nicPlaceholder')}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('intake.citizenName')}
                </label>
                <Input
                  value={formData.citizenName}
                  onChange={(e) => handleInputChange('citizenName', e.target.value)}
                  placeholder={t('intake.namePlaceholder')}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('intake.citizenAddress')}
                </label>
                <Textarea
                  value={formData.citizenAddress}
                  onChange={(e) => handleInputChange('citizenAddress', e.target.value)}
                  placeholder={t('intake.addressPlaceholder')}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('intake.citizenContact')}
                </label>
                <Input
                  value={formData.citizenContact}
                  onChange={(e) => handleInputChange('citizenContact', e.target.value)}
                  placeholder={t('intake.contactPlaceholder')}
                  required
                />
              </div>
            </div>
          </Card>

          {/* Service Information */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t('intake.serviceInfo')}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <Select
                  value={formData.subjectId}
                  onChange={(e) => handleInputChange('subjectId', e.target.value)}
                  options={allowedSubjects.map(s => ({ value: s.id, label: s.name }))}
                  placeholder={subjectsLoading ? "Loading subjects..." : allowedSubjects.length === 0 ? "No available subjects" : "Select a subject"}
                  required
                  disabled={subjectsLoading || allowedSubjects.length === 0}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('intake.preferredDateTime')}
                </label>
                <Input
                  type="date"
                  value={formData.preferredDateTime}
                  onChange={(e) => handleInputChange('preferredDateTime', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('intake.initialDocuments')}
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.documentsPresent}
                      onChange={(e) => handleInputChange('documentsPresent', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Initial documents are present
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <Textarea
                  value={formData.additionalNotes}
                  onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                  placeholder="Any additional information..."
                  rows={3}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Document Upload Section */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Required Documents
          </h3>
          <FileUpload
            fields={intakeFileFields}
            onFilesChange={handleFilesChange}
            readOnly={false}
          />
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/dashboard')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex items-center"
          >
            {loading ? 'Creating Request...' : 'Create Service Request'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default IntakePage; 