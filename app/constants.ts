import { UserRole, Office, WorkflowDefinition, WorkflowStepDefinition, FieldDefinition, Section } from './types.ts';

export const APP_NAME = "GovFlow";

export const USER_ROLES_OPTIONS = [
  { value: UserRole.FRONT_DESK, label: 'Front-Desk Officer' },
  { value: UserRole.OFFICER, label: 'Officer' },
  { value: UserRole.SECTION_HEAD, label: 'Section Head' },
  { value: UserRole.DEPARTMENT_HEAD, label: 'Department Head' },
  { value: UserRole.ADMIN, label: 'Administrator' },
];

export const MOCK_SERVICE_CATEGORIES = [
  { id: 'sc1', name: 'Land Services' },
  { id: 'sc2', name: 'Business Permits' },
  { id: 'sc3', name: 'Scholarship Application' },
  { id: 'sc4', name: 'Utility Connection' },
];

export const MOCK_OFFICES: Office[] = [
  { id: 'office1', name: 'Land Registry Intake Section' },
  { id: 'office2', name: 'Land Survey Section' },
  { id: 'office3', name: 'Legal Review Section (Land)' },
  { id: 'office4', name: 'Business Permit Intake' },
  { id: 'office5', name: 'Business Inspection Unit' },
  { id: 'office6', name: 'Scholarship Desk' },
  { id: 'office7', name: 'Education Dept. Review' },
  { id: 'office8', name: 'Final Approval Office' }
];

const landServiceStep1Fields: FieldDefinition[] = [
  { id: 'lsf1', name: 'plotNumber', label: 'Plot Number', type: 'text', validationRules: { required: true } },
  { id: 'lsf2', name: 'deedReference', label: 'Deed Reference', type: 'text', validationRules: { required: true } },
];
const landServiceStep2Fields: FieldDefinition[] = [
  { id: 'lsf3', name: 'surveyDate', label: 'Survey Date', type: 'date', validationRules: { required: true } },
  { id: 'lsf4', name: 'surveyorNotes', label: 'Surveyor Notes', type: 'textarea' },
];
const landServiceStep3Fields: FieldDefinition[] = [
  { id: 'lsf5', name: 'legalOpinion', label: 'Legal Opinion', type: 'textarea', validationRules: { required: true } },
  { id: 'lsf6', name: 'meetsRegulations', label: 'Meets All Regulations', type: 'checkbox'},
];

const businessPermitStep1Fields: FieldDefinition[] = [
  { id: 'bpf1', name: 'businessName', label: 'Business Name', type: 'text', validationRules: { required: true } },
  { id: 'bpf2', name: 'businessType', label: 'Type of Business', type: 'text', validationRules: { required: true } },
];
const businessPermitStep2Fields: FieldDefinition[] = [
  { id: 'bpf3', name: 'inspectionDate', label: 'Inspection Date', type: 'date' },
  { id: 'bpf4', name: 'inspectionOutcome', label: 'Inspection Outcome', type: 'select', options: [{value: 'pass', label: 'Pass'}, {value: 'fail', label: 'Fail'}]},
];

export const MOCK_WORKFLOW_DEFINITIONS: WorkflowDefinition[] = [
  {
    id: 'wf1',
    name: 'Standard Land Transfer',
    description: 'Complete land transfer workflow',
    subjectId: 'sc1',
    steps: [
      { 
        id: 'wf1s1', 
        name: 'Initial Document Verification', 
        description: 'Verify initial documents',
        sectionId: 'sec1',
        officeId: 'office1',
        formFields: landServiceStep1Fields, 
        requiredDocuments: ['Original Deed', 'NIC Copy'], 
        approvalType: 'SectionHead', 
        assignableToOfficeIds: ['office1'] 
      },
      { 
        id: 'wf1s2', 
        name: 'Field Survey', 
        description: 'Conduct field survey',
        sectionId: 'sec2',
        officeId: 'office2',
        formFields: landServiceStep2Fields, 
        requiredDocuments: ['Survey Plan Draft'], 
        approvalType: 'SectionHead', 
        assignableToOfficeIds: ['office2'] 
      },
      { 
        id: 'wf1s3', 
        name: 'Legal Review', 
        description: 'Legal review of documents',
        sectionId: 'sec3',
        officeId: 'office3',
        formFields: landServiceStep3Fields, 
        requiredDocuments: ['Completed Survey Plan', 'Compliance Checklist'], 
        approvalType: 'SectionHead', 
        assignableToOfficeIds: ['office3'] 
      },
      { 
        id: 'wf1s4', 
        name: 'Final Approval', 
        description: 'Final approval process',
        sectionId: 'sec4',
        officeId: 'office8',
        formFields: [], 
        requiredDocuments: ['All Approved Documents'], 
        approvalType: 'DepartmentHead', 
        assignableToOfficeIds: ['office8'] 
      },
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
    version: '1.0'
  },
  {
    id: 'wf2',
    name: 'New Business Permit',
    description: 'Business permit application workflow',
    subjectId: 'sc2',
    steps: [
      { 
        id: 'wf2s1', 
        name: 'Application Intake', 
        description: 'Initial application intake',
        sectionId: 'sec1',
        officeId: 'office4',
        formFields: businessPermitStep1Fields, 
        requiredDocuments: ['Business Registration Docs', 'Tax ID'], 
        approvalType: 'SectionHead', 
        assignableToOfficeIds: ['office4'] 
      },
      { 
        id: 'wf2s2', 
        name: 'Premises Inspection', 
        description: 'Inspect business premises',
        sectionId: 'sec2',
        officeId: 'office5',
        formFields: businessPermitStep2Fields, 
        requiredDocuments: ['Inspection Report'], 
        approvalType: 'SectionHead', 
        assignableToOfficeIds: ['office5'] 
      },
      { 
        id: 'wf2s3', 
        name: 'Final Permit Issuance', 
        description: 'Issue final permit',
        sectionId: 'sec3',
        officeId: 'office8',
        formFields: [], 
        requiredDocuments: [], 
        approvalType: 'DepartmentHead', 
        assignableToOfficeIds: ['office8'] 
      },
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
    version: '1.0'
  },
];

// Sample Workflow Definitions
export const SAMPLE_WORKFLOW_DEFINITIONS: WorkflowDefinition[] = [
  {
    id: 'wf_business_registration',
    name: 'Business Registration Process',
    description: 'Complete workflow for business registration including verification and approval',
    subjectId: 'sub_business_registration',
    steps: [
      {
        id: 'step_intake',
        name: 'Initial Intake',
        description: 'Collect basic business information and documents',
        sectionId: 'sec_front_desk',
        officeId: 'office_main',
        formFields: [
          {
            id: 'field_business_name',
            label: 'Business Name',
            name: 'businessName',
            type: 'text',
            required: true,
            placeholder: 'Enter business name'
          },
          {
            id: 'field_business_type',
            label: 'Business Type',
            name: 'businessType',
            type: 'select',
            required: true,
            options: [
              { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
              { value: 'partnership', label: 'Partnership' },
              { value: 'corporation', label: 'Corporation' },
              { value: 'llc', label: 'Limited Liability Company' }
            ]
          },
          {
            id: 'field_business_address',
            label: 'Business Address',
            name: 'businessAddress',
            type: 'textarea',
            required: true,
            placeholder: 'Enter complete business address'
          },
          {
            id: 'field_business_plan',
            label: 'Business Plan Document',
            name: 'businessPlan',
            type: 'file',
            required: true,
            placeholder: 'Upload business plan (PDF/DOC)'
          },
          {
            id: 'field_identity_docs',
            label: 'Identity Documents',
            name: 'identityDocuments',
            type: 'file',
            required: true,
            placeholder: 'Upload identity documents'
          }
        ],
        requiredDocuments: ['Business Plan', 'Identity Documents', 'Address Proof'],
        approvalType: 'None',
        estimatedDuration: 2
      },
      {
        id: 'step_verification',
        name: 'Document Verification',
        description: 'Verify submitted documents and business information',
        sectionId: 'sec_verification',
        officeId: 'office_main',
        formFields: [
          {
            id: 'field_verification_notes',
            label: 'Verification Notes',
            name: 'verificationNotes',
            type: 'textarea',
            required: false,
            placeholder: 'Add verification notes'
          },
          {
            id: 'field_documents_verified',
            label: 'Documents Verified',
            name: 'documentsVerified',
            type: 'checkbox',
            required: true
          },
          {
            id: 'field_verification_report',
            label: 'Verification Report',
            name: 'verificationReport',
            type: 'file',
            required: true,
            placeholder: 'Upload verification report'
          }
        ],
        requiredDocuments: ['Verification Report'],
        approvalType: 'SectionHead',
        estimatedDuration: 24
      },
      {
        id: 'step_approval',
        name: 'Department Approval',
        description: 'Final approval by department head',
        sectionId: 'sec_approval',
        officeId: 'office_main',
        formFields: [
          {
            id: 'field_approval_decision',
            label: 'Approval Decision',
            name: 'approvalDecision',
            type: 'select',
            required: true,
            options: [
              { value: 'approved', label: 'Approved' },
              { value: 'rejected', label: 'Rejected' },
              { value: 'pending_correction', label: 'Pending Correction' }
            ]
          },
          {
            id: 'field_approval_comments',
            label: 'Approval Comments',
            name: 'approvalComments',
            type: 'textarea',
            required: false,
            placeholder: 'Add approval comments'
          },
          {
            id: 'field_approval_certificate',
            label: 'Approval Certificate',
            name: 'approvalCertificate',
            type: 'file',
            required: true,
            placeholder: 'Upload approval certificate'
          }
        ],
        requiredDocuments: ['Approval Certificate'],
        approvalType: 'DepartmentHead',
        estimatedDuration: 48
      }
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
    version: '1.0'
  },
  {
    id: 'wf_license_renewal',
    name: 'License Renewal Process',
    description: 'Workflow for renewing business licenses',
    subjectId: 'sub_license_renewal',
    steps: [
      {
        id: 'step_renewal_intake',
        name: 'Renewal Application',
        description: 'Submit renewal application with updated information',
        sectionId: 'sec_front_desk',
        officeId: 'office_main',
        formFields: [
          {
            id: 'field_current_license',
            label: 'Current License Number',
            name: 'currentLicenseNumber',
            type: 'text',
            required: true,
            placeholder: 'Enter current license number'
          },
          {
            id: 'field_renewal_reason',
            label: 'Reason for Renewal',
            name: 'renewalReason',
            type: 'textarea',
            required: true,
            placeholder: 'Explain reason for renewal'
          }
        ],
        requiredDocuments: ['Current License', 'Updated Business Information'],
        approvalType: 'None',
        estimatedDuration: 1
      },
      {
        id: 'step_renewal_review',
        name: 'Renewal Review',
        description: 'Review renewal application and verify compliance',
        sectionId: 'sec_compliance',
        officeId: 'office_main',
        formFields: [
          {
            id: 'field_compliance_check',
            label: 'Compliance Check',
            name: 'complianceCheck',
            type: 'checkbox',
            required: true
          },
          {
            id: 'field_compliance_notes',
            label: 'Compliance Notes',
            name: 'complianceNotes',
            type: 'textarea',
            required: false,
            placeholder: 'Add compliance notes'
          }
        ],
        requiredDocuments: ['Compliance Report'],
        approvalType: 'SectionHead',
        estimatedDuration: 24
      },
      {
        id: 'step_renewal_approval',
        name: 'Renewal Approval',
        description: 'Final approval for license renewal',
        sectionId: 'sec_approval',
        officeId: 'office_main',
        formFields: [
          {
            id: 'field_renewal_decision',
            label: 'Renewal Decision',
            name: 'renewalDecision',
            type: 'select',
            required: true,
            options: [
              { value: 'approved', label: 'Approved' },
              { value: 'rejected', label: 'Rejected' }
            ]
          }
        ],
        requiredDocuments: ['Renewed License'],
        approvalType: 'DepartmentHead',
        estimatedDuration: 24
      }
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
    version: '1.0'
  }
];

// Sample Offices
export const SAMPLE_OFFICES: Office[] = [
  {
    id: 'office_main',
    name: 'Main Government Office'
  },
  {
    id: 'office_branch1',
    name: 'Branch Office 1'
  },
  {
    id: 'office_branch2',
    name: 'Branch Office 2'
  }
];

// Sample Sections
export const SAMPLE_SECTIONS: Section[] = [
  {
    id: 'sec_front_desk',
    name: 'Front Desk',
    description: 'Handles initial intake and customer service',
    officeId: 'office_main',
    permissions: {
      canApprove: false,
      canFillData: true,
      canUploadDocuments: true,
      canAssign: false
    },
    services: ['sub_business_registration', 'sub_license_renewal'],
    users: ['user_fd001']
  },
  {
    id: 'sec_verification',
    name: 'Verification Section',
    description: 'Verifies documents and information',
    officeId: 'office_main',
    permissions: {
      canApprove: true,
      canFillData: true,
      canUploadDocuments: true,
      canAssign: false
    },
    services: ['sub_business_registration'],
    users: ['user_sh001']
  },
  {
    id: 'sec_compliance',
    name: 'Compliance Section',
    description: 'Checks compliance with regulations',
    officeId: 'office_main',
    permissions: {
      canApprove: true,
      canFillData: true,
      canUploadDocuments: true,
      canAssign: false
    },
    services: ['sub_license_renewal'],
    users: ['user_sh001']
  },
  {
    id: 'sec_approval',
    name: 'Approval Section',
    description: 'Final approval authority',
    officeId: 'office_main',
    permissions: {
      canApprove: true,
      canFillData: false,
      canUploadDocuments: false,
      canAssign: true
    },
    services: ['sub_business_registration', 'sub_license_renewal'],
    users: ['user_dh001']
  }
];

// Initialize sample data in localStorage
export const initializeSampleData = () => {
  // Initialize workflows
  const existingWorkflows = localStorage.getItem('govflow_workflows');
  if (!existingWorkflows) {
    localStorage.setItem('govflow_workflows', JSON.stringify(SAMPLE_WORKFLOW_DEFINITIONS));
  }

  // Initialize offices
  const existingOffices = localStorage.getItem('govflow-offices');
  if (!existingOffices) {
    localStorage.setItem('govflow-offices', JSON.stringify(SAMPLE_OFFICES));
  }

  // Initialize sections
  const existingSections = localStorage.getItem('govflow-sections');
  if (!existingSections) {
    localStorage.setItem('govflow-sections', JSON.stringify(SAMPLE_SECTIONS));
  }

  // Initialize subjects if not exists
  const existingSubjects = localStorage.getItem('govflow-subjects');
  if (!existingSubjects) {
    const subjects = [
      { id: 'sub_business_registration', name: 'Business Registration' },
      { id: 'sub_license_renewal', name: 'License Renewal' },
      { id: 'sub_new_request', name: 'New Request' }
    ];
    localStorage.setItem('govflow-subjects', JSON.stringify(subjects));
  }

  // Initialize sample service requests for testing
  const existingRequests = localStorage.getItem('govflow-service-requests');
  if (!existingRequests) {
    const sampleRequests = [
      {
        id: 'SR00001',
        serviceRequestData: {
          nicNumber: '123456789V',
          citizenName: 'John Doe',
          citizenAddress: '123 Main Street, Colombo',
          citizenContact: '+94 11 2345678',
          subjectId: 'sub_business_registration',
          preferredDateTime: '2024-01-15T10:00:00Z',
          initialDocumentsPresent: true,
          businessName: 'Tech Solutions Ltd',
          businessType: 'corporation',
          businessAddress: '456 Business Avenue, Colombo'
        },
        status: 'InProgress',
        currentStepId: 'step_verification',
        assignedToOfficeId: 'office_main',
        assignedToUserId: 'user_of001',
        workflowDefinitionId: 'wf_business_registration',
        createdAt: '2024-01-15T09:00:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        history: [
          {
            stepId: 'INTAKE',
            stepName: 'Intake',
            userId: 'user_fd001',
            userName: 'Front Desk Officer',
            timestamp: '2024-01-15T09:00:00Z',
            action: 'Service Request Created & Assigned',
            comment: 'Assigned to Main Government Office',
            data: {
              businessName: 'Tech Solutions Ltd',
              businessType: 'corporation',
              businessAddress: '456 Business Avenue, Colombo'
            }
          },
          {
            stepId: 'step_intake',
            stepName: 'Initial Intake',
            userId: 'user_of001',
            userName: 'Office Officer',
            timestamp: '2024-01-15T10:30:00Z',
            action: 'Data Submitted for Review/Approval',
            data: {
              businessName: 'Tech Solutions Ltd',
              businessType: 'corporation',
              businessAddress: '456 Business Avenue, Colombo'
            },
            documents: [
              {
                id: 'doc_1',
                name: 'business_plan.pdf',
                url: 'blob:mock-url-1',
                uploadedAt: '2024-01-15T10:30:00Z',
                uploadedBy: 'user_of001'
              },
              {
                id: 'doc_2',
                name: 'identity_documents.pdf',
                url: 'blob:mock-url-2',
                uploadedAt: '2024-01-15T10:30:00Z',
                uploadedBy: 'user_of001'
              }
            ]
          }
        ]
      }
    ];
    localStorage.setItem('govflow-service-requests', JSON.stringify(sampleRequests));
  }
};