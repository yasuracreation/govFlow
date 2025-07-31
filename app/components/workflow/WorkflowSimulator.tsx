import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { WorkflowDefinition, WorkflowStepDefinition, ServiceRequest } from '../../types';

interface WorkflowSimulatorProps {
  workflow: WorkflowDefinition;
  onClose: () => void;
}

interface SimulationStep {
  stepId: string;
  stepName: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  startTime?: string;
  endTime?: string;
  duration?: number;
  assignedTo?: string;
  data?: Record<string, any>;
  comments?: string;
}

interface SimulationState {
  currentStepIndex: number;
  steps: SimulationStep[];
  overallStatus: 'not-started' | 'in-progress' | 'completed' | 'failed';
  startTime?: string;
  endTime?: string;
  totalDuration?: number;
}

const WorkflowSimulator: React.FC<WorkflowSimulatorProps> = ({
  workflow,
  onClose
}) => {
  const { t } = useTranslation();
  const [simulationState, setSimulationState] = useState<SimulationState>({
    currentStepIndex: 0,
    steps: workflow.steps.map(step => ({
      stepId: step.id,
      stepName: step.name,
      status: 'pending'
    })),
    overallStatus: 'not-started'
  });
  const [isRunning, setIsRunning] = useState(false);
  const [showStepDetails, setShowStepDetails] = useState<string | null>(null);

  const startSimulation = useCallback(async () => {
    setIsRunning(true);
    setSimulationState(prev => ({
      ...prev,
      overallStatus: 'in-progress',
      startTime: new Date().toISOString()
    }));

    // Simulate workflow execution
    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      
      // Update current step
      setSimulationState(prev => ({
        ...prev,
        currentStepIndex: i,
        steps: prev.steps.map((s, index) => 
          index === i 
            ? { ...s, status: 'in-progress', startTime: new Date().toISOString() }
            : s
        )
      }));

      // Simulate step processing time
      const processingTime = Math.random() * 3000 + 1000; // 1-4 seconds
      await new Promise(resolve => setTimeout(resolve, processingTime));

      // Simulate step completion
      const success = Math.random() > 0.1; // 90% success rate
      const endTime = new Date().toISOString();
      
      setSimulationState(prev => ({
        ...prev,
        steps: prev.steps.map((s, index) => 
          index === i 
            ? { 
                ...s, 
                status: success ? 'completed' : 'failed',
                endTime,
                duration: new Date(endTime).getTime() - new Date(s.startTime!).getTime(),
                assignedTo: `User ${Math.floor(Math.random() * 100) + 1}`,
                data: generateStepData(step),
                comments: success ? 'Step completed successfully' : 'Step failed due to validation error'
              }
            : s
        )
      }));

      if (!success) {
        setSimulationState(prev => ({
          ...prev,
          overallStatus: 'failed',
          endTime: new Date().toISOString()
        }));
        break;
      }
    }

    // Mark as completed if all steps succeeded
    if (simulationState.steps.every(step => step.status === 'completed')) {
      setSimulationState(prev => ({
        ...prev,
        overallStatus: 'completed',
        endTime: new Date().toISOString()
      }));
    }

    setIsRunning(false);
  }, [workflow, simulationState.steps]);

  const resetSimulation = useCallback(() => {
    setSimulationState({
      currentStepIndex: 0,
      steps: workflow.steps.map(step => ({
        stepId: step.id,
        stepName: step.name,
        status: 'pending'
      })),
      overallStatus: 'not-started'
    });
    setShowStepDetails(null);
  }, [workflow]);

  const generateStepData = (step: WorkflowStepDefinition): Record<string, any> => {
    const data: Record<string, any> = {};
    
    step.formFields.forEach(field => {
      switch (field.type) {
        case 'text':
          data[field.name] = `Sample ${field.label}`;
          break;
        case 'number':
          data[field.name] = Math.floor(Math.random() * 1000);
          break;
        case 'date':
          data[field.name] = new Date().toISOString().split('T')[0];
          break;
        case 'checkbox':
          data[field.name] = Math.random() > 0.5;
          break;
        case 'select':
          data[field.name] = field.options?.[0]?.value || 'option1';
          break;
        case 'email':
          data[field.name] = 'sample@example.com';
          break;
        case 'phone':
          data[field.name] = '+94 11 123 4567';
          break;
        default:
          data[field.name] = 'Sample data';
      }
    });

    return data;
  };

  const getStatusColor = (status: SimulationStep['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
    }
  };

  const getStatusIcon = (status: SimulationStep['status']) => {
    switch (status) {
      case 'pending':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'in-progress':
        return (
          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case 'completed':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'failed':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
    }
  };

  const progress = simulationState.steps.filter(step => step.status === 'completed').length / workflow.steps.length * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Workflow Simulator</h3>
              <p className="text-sm text-gray-600">Testing workflow: {workflow.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Simulation Controls */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-3">
              <button
                onClick={startSimulation}
                disabled={isRunning || simulationState.overallStatus === 'in-progress'}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isRunning ? 'Running...' : 'Start Simulation'}
              </button>
              <button
                onClick={resetSimulation}
                disabled={isRunning}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                Reset
              </button>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-600">
                Overall Status: 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(simulationState.overallStatus as any)}`}>
                  {simulationState.overallStatus.replace('-', ' ')}
                </span>
              </div>
              {simulationState.startTime && (
                <div className="text-xs text-gray-500 mt-1">
                  Started: {new Date(simulationState.startTime).toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Steps List */}
          <div className="space-y-3">
            {simulationState.steps.map((step, index) => (
              <div key={step.stepId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="font-medium text-gray-900">{step.stepName}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(step.status)}`}>
                          {getStatusIcon(step.status)}
                          <span className="ml-1">{step.status.replace('-', ' ')}</span>
                        </span>
                        {step.assignedTo && (
                          <span className="text-xs text-gray-500">Assigned to: {step.assignedTo}</span>
                        )}
                        {step.duration && (
                          <span className="text-xs text-gray-500">Duration: {step.duration}ms</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowStepDetails(showStepDetails === step.stepId ? null : step.stepId)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      {showStepDetails === step.stepId ? 'Hide' : 'Details'}
                    </button>
                  </div>
                </div>

                {/* Step Details */}
                {showStepDetails === step.stepId && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Form Data</h5>
                        {step.data && Object.keys(step.data).length > 0 ? (
                          <div className="space-y-1">
                            {Object.entries(step.data).map(([key, value]) => (
                              <div key={key} className="text-xs">
                                <span className="font-medium">{key}:</span> {String(value)}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500">No form data</p>
                        )}
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Comments</h5>
                        <p className="text-xs text-gray-600">{step.comments || 'No comments'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Simulation Summary */}
          {simulationState.endTime && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Simulation Summary</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Duration:</span>
                  <div className="font-medium">
                    {simulationState.totalDuration ? `${simulationState.totalDuration}ms` : 'Calculating...'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Steps Completed:</span>
                  <div className="font-medium">
                    {simulationState.steps.filter(s => s.status === 'completed').length} / {workflow.steps.length}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Success Rate:</span>
                  <div className="font-medium">
                    {Math.round((simulationState.steps.filter(s => s.status === 'completed').length / workflow.steps.length) * 100)}%
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowSimulator; 