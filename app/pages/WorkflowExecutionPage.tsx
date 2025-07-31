import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { WorkflowDefinition, WorkflowStepDefinition, ServiceRequest } from '../types';
import WorkflowValidator from '../components/workflow/WorkflowValidator';
import WorkflowSimulator from '../components/workflow/WorkflowSimulator';
import workflowStudioService from '../services/workflowStudioService';
import workflowExecutionService from '../services/workflowExecutionService';
import CustomAlert from '../components/common/CustomAlert';

const WorkflowExecutionPage: React.FC = () => {
  const { t } = useTranslation();
  const { workflowId } = useParams<{ workflowId: string }>();
  const [workflow, setWorkflow] = useState<WorkflowDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [showValidator, setShowValidator] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [executionContext, setExecutionContext] = useState<any>(null);
  const [currentStepData, setCurrentStepData] = useState<Record<string, any>>({});
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [alert, setAlert] = useState<{ type: 'error'; message: string; show: boolean } | null>(null);

  useEffect(() => {
    if (workflowId) {
      loadWorkflow();
    }
  }, [workflowId]);

  const loadWorkflow = async () => {
    try {
      setLoading(true);
      const data = await workflowStudioService.getWorkflowById(workflowId!);
      setWorkflow(data);
    } catch (error) {
      console.error('Error loading workflow:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartExecution = async () => {
    if (!workflow) return;

    try {
      const context = await workflowExecutionService.startWorkflow(
        workflow.id,
        { initialData: 'Sample data' },
        'user-1'
      );
      setExecutionContext(context);
    } catch (error) {
      console.error('Error starting workflow execution:', error);
    }
  };

  const handleExecuteStep = async () => {
    if (!executionContext) return;

    try {
      const result = await workflowExecutionService.executeStep(
        executionContext,
        currentStepData,
        'user-1'
      );

      if (result.success) {
        setCurrentStepData({});
        // Refresh execution context
        const updatedContext = await workflowExecutionService.getExecutionContext(executionContext.serviceRequestId);
        setExecutionContext(updatedContext);
      } else {
        setAlert({ type: 'error', message: `Step execution failed: ${result.error}`, show: true });
      }
    } catch (error) {
      console.error('Error executing step:', error);
    }
  };

  const handleValidationComplete = (errors: any[]) => {
    setValidationErrors(errors);
  };

  const getCurrentStep = () => {
    if (!executionContext) return null;
    return workflowExecutionService.getCurrentStep(executionContext);
  };

  const getNextStep = () => {
    if (!executionContext) return null;
    return workflowExecutionService.getNextStep(executionContext);
  };

  const getProgress = () => {
    if (!executionContext) return 0;
    return workflowExecutionService.getWorkflowProgress(executionContext);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Workflow Not Found</h2>
          <p className="text-gray-600 mt-2">The requested workflow could not be found.</p>
        </div>
      </div>
    );
  }

  if (showValidator) {
    return (
      <div className="h-screen flex flex-col">
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Workflow Validation</h1>
              <p className="text-gray-600 mt-1">Validating workflow: {workflow.name}</p>
            </div>
            <button
              onClick={() => setShowValidator(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              {t('common.back')}
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <WorkflowValidator
            workflow={workflow}
            onValidationComplete={handleValidationComplete}
          />
        </div>
      </div>
    );
  }

  if (showSimulator) {
    return (
      <WorkflowSimulator
        workflow={workflow}
        onClose={() => setShowSimulator(false)}
      />
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('workflow.execution.title')}</h1>
              <p className="text-gray-600 mt-2">Workflow: {workflow.name}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowValidator(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Validate Workflow
              </button>
              <button
                onClick={() => setShowSimulator(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Simulate Workflow
              </button>
            </div>
          </div>
        </div>

        {alert && (
          <CustomAlert
            type={alert.type}
            message={alert.message}
            show={alert.show}
            onClose={() => setAlert(null)}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Workflow Overview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow Overview</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="text-sm text-gray-900">{workflow.name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Steps</label>
                  <p className="text-sm text-gray-900">{workflow.steps.length} steps</p>
                </div>

                {executionContext && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <p className="text-sm text-gray-900 capitalize">{executionContext.status}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Progress</label>
                      <div className="mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${getProgress()}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{Math.round(getProgress())}% complete</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {!executionContext && (
                <button
                  onClick={handleStartExecution}
                  className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('workflow.execution.start')}
                </button>
              )}
            </div>
          </div>

          {/* Execution Area */}
          <div className="lg:col-span-2">
            {executionContext ? (
              <div className="space-y-6">
                {/* Current Step */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('workflow.execution.currentStep')}
                  </h3>
                  
                  {getCurrentStep() ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900">{getCurrentStep()!.name}</h4>
                        <p className="text-sm text-gray-600">{getCurrentStep()!.description}</p>
                      </div>

                      {/* Form Fields */}
                      {getCurrentStep()!.formFields.length > 0 && (
                        <div className="space-y-3">
                          <h5 className="text-sm font-medium text-gray-700">Form Fields</h5>
                          {getCurrentStep()!.formFields.map((field) => (
                            <div key={field.id}>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                {field.label}
                                {field.required && <span className="text-red-500">*</span>}
                              </label>
                              {field.type === 'text' && (
                                <input
                                  type="text"
                                  value={currentStepData[field.name] || ''}
                                  onChange={(e) => setCurrentStepData(prev => ({ ...prev, [field.name]: e.target.value }))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  required={field.required}
                                />
                              )}
                              {field.type === 'textarea' && (
                                <textarea
                                  value={currentStepData[field.name] || ''}
                                  onChange={(e) => setCurrentStepData(prev => ({ ...prev, [field.name]: e.target.value }))}
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  required={field.required}
                                />
                              )}
                              {field.type === 'checkbox' && (
                                <input
                                  type="checkbox"
                                  checked={currentStepData[field.name] || false}
                                  onChange={(e) => setCurrentStepData(prev => ({ ...prev, [field.name]: e.target.checked }))}
                                  className="mr-2"
                                />
                              )}
                              {field.type === 'select' && (
                                <select
                                  value={currentStepData[field.name] || ''}
                                  onChange={(e) => setCurrentStepData(prev => ({ ...prev, [field.name]: e.target.value }))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  required={field.required}
                                >
                                  <option value="">Select an option</option>
                                  {field.options?.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Required Documents */}
                      {getCurrentStep()!.requiredDocuments.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Required Documents</h5>
                          <ul className="space-y-1">
                            {getCurrentStep()!.requiredDocuments.map((doc, index) => (
                              <li key={index} className="text-sm text-gray-600 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                {doc}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button
                          onClick={handleExecuteStep}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          {t('workflow.execution.complete')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h4 className="mt-2 text-lg font-medium text-gray-900">Workflow Completed!</h4>
                      <p className="mt-1 text-sm text-gray-500">All steps have been executed successfully.</p>
                    </div>
                  )}
                </div>

                {/* Next Step Preview */}
                {getNextStep() && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {t('workflow.execution.nextStep')}
                    </h3>
                    <div>
                      <h4 className="font-medium text-gray-900">{getNextStep()!.name}</h4>
                      <p className="text-sm text-gray-600">{getNextStep()!.description}</p>
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getNextStep()!.approvalType !== 'None' ? `${getNextStep()!.approvalType} Approval Required` : 'No Approval Required'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No Active Execution</h3>
                  <p className="mt-1 text-sm text-gray-500">Start the workflow to begin execution.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Workflow Steps Overview */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow Steps</h3>
            <div className="space-y-4">
              {workflow.steps.map((step, index) => (
                <div key={step.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{step.name}</h4>
                    <p className="text-sm text-gray-600">{step.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-xs text-gray-500">{step.estimatedDuration}h</span>
                      <span className="text-xs text-gray-500">{step.formFields.length} fields</span>
                      <span className="text-xs text-gray-500">{step.requiredDocuments.length} documents</span>
                      {step.isParallel && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Parallel
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      step.approvalType === 'None' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {step.approvalType === 'None' ? 'No Approval' : `${step.approvalType} Approval`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowExecutionPage; 