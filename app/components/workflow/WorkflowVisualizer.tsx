import React, { useState, useEffect } from 'react';
import { WorkflowExecution, WorkflowNode, ServiceRequest, WorkflowDefinition } from '@/types';
import Card from '../common/Card';
import Button from '../common/Button';
import CustomAlert from '../common/CustomAlert';
import { Eye, CheckCircle, XCircle, Clock, AlertCircle, MessageSquare } from 'lucide-react';

interface WorkflowVisualizerProps {
  serviceRequest: ServiceRequest;
  workflowDefinition: WorkflowDefinition;
  onStepClick?: (stepId: string) => void;
  onApprove?: (stepId: string, comment?: string) => void;
  onReject?: (stepId: string, reason: string) => void;
  onRequestCorrection?: (stepId: string, comment: string) => void;
}

const WorkflowVisualizer: React.FC<WorkflowVisualizerProps> = ({
  serviceRequest,
  workflowDefinition,
  onStepClick,
  onApprove,
  onReject,
  onRequestCorrection
}) => {
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [showComments, setShowComments] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; message: string; show: boolean } | null>(null);

  const getStepStatus = (stepId: string) => {
    const step = serviceRequest.history.find(h => h.stepId === stepId);
    if (!step) return 'pending';
    
    if (step.action.includes('Rejected')) return 'rejected';
    if (step.action.includes('Approved')) return 'completed';
    if (step.action.includes('Correction')) return 'correction_requested';
    if (step.action.includes('Submitted')) return 'in_progress';
    
    return 'pending';
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'in_progress':
        return <Clock className="h-6 w-6 text-blue-500" />;
      case 'correction_requested':
        return <AlertCircle className="h-6 w-6 text-orange-500" />;
      default:
        return <Clock className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-50';
      case 'rejected':
        return 'border-red-500 bg-red-50';
      case 'in_progress':
        return 'border-blue-500 bg-blue-50';
      case 'correction_requested':
        return 'border-orange-500 bg-orange-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const getStepData = (stepId: string) => {
    return serviceRequest.history.find(h => h.stepId === stepId);
  };

  const canPerformAction = (stepId: string) => {
    const stepData = getStepData(stepId);
    // Can only perform actions if step hasn't been processed yet
    return !stepData || (!stepData.action.includes('Approved') && !stepData.action.includes('Rejected'));
  };

  const handleStepClick = (stepId: string) => {
    setSelectedStep(selectedStep === stepId ? null : stepId);
    onStepClick?.(stepId);
  };

  const handleApprove = () => {
    if (selectedStep && onApprove) {
      if (!canPerformAction(selectedStep)) {
        setAlert({ type: 'warning', message: 'This step has already been processed and cannot be modified', show: true });
        return;
      }
      onApprove(selectedStep, comment);
      setComment('');
      setSelectedStep(null);
    }
  };

  const handleReject = () => {
    if (selectedStep && rejectionReason && onReject) {
      if (!canPerformAction(selectedStep)) {
        setAlert({ type: 'warning', message: 'This step has already been processed and cannot be modified', show: true });
        return;
      }
      onReject(selectedStep, rejectionReason);
      setRejectionReason('');
      setSelectedStep(null);
    }
  };

  const handleRequestCorrection = () => {
    if (selectedStep && comment && onRequestCorrection) {
      if (!canPerformAction(selectedStep)) {
        setAlert({ type: 'warning', message: 'This step has already been processed and cannot be modified', show: true });
        return;
      }
      onRequestCorrection(selectedStep, comment);
      setComment('');
      setSelectedStep(null);
    }
  };

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
      {/* Workflow Header */}
      <Card>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Workflow Progress</h2>
            <p className="text-gray-600">Service Request: {serviceRequest.id}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Status</div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              serviceRequest.status === 'Completed' ? 'bg-green-100 text-green-800' :
              serviceRequest.status === 'Rejected' ? 'bg-red-100 text-red-800' :
              serviceRequest.status === 'InProgress' ? 'bg-blue-100 text-blue-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {serviceRequest.status}
            </div>
          </div>
        </div>
      </Card>

      {/* Workflow Steps */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Workflow Steps</h3>
        <div className="space-y-4">
          {workflowDefinition.steps.map((step, index) => {
            const status = getStepStatus(step.id);
            const stepData = getStepData(step.id);
            const isCurrentStep = serviceRequest.currentStepId === step.id;
            const isSelected = selectedStep === step.id;
            const canAction = canPerformAction(step.id);

            return (
              <div key={step.id} className="relative">
                {/* Connection Line */}
                {index < workflowDefinition.steps.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-300"></div>
                )}

                <div className={`border-2 rounded-lg p-4 transition-all cursor-pointer ${
                  getStepColor(status)
                } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => handleStepClick(step.id)}>
                  
                  <div className="flex items-start space-x-4">
                    {/* Step Icon */}
                    <div className="flex-shrink-0">
                      {getStepIcon(status)}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-medium text-gray-900">
                          Step {index + 1}: {step.name}
                          {isCurrentStep && (
                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Current
                            </span>
                          )}
                          {!canAction && (
                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Processed
                            </span>
                          )}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowComments(showComments === step.id ? null : step.id);
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStepClick(step.id);
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                      
                      {stepData && (
                        <div className="mt-3 text-sm text-gray-500">
                          <div>Last updated: {new Date(stepData.timestamp).toLocaleString()}</div>
                          <div>By: {stepData.userName}</div>
                          <div>Action: {stepData.action}</div>
                          {stepData.comment && (
                            <div>Comment: {stepData.comment}</div>
                          )}
                        </div>
                      )}

                      {/* Step Details */}
                      {isSelected && (
                        <div className="mt-4 p-4 bg-white rounded border">
                          <h5 className="font-medium text-gray-900 mb-3">Step Details</h5>
                          
                          {/* Form Data */}
                          {stepData?.data && Object.keys(stepData.data).length > 0 && (
                            <div className="mb-4">
                              <h6 className="text-sm font-medium text-gray-700 mb-2">Form Data</h6>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                {Object.entries(stepData.data).map(([key, value]) => (
                                  <div key={key}>
                                    <span className="font-medium">{key}:</span> {String(value)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Documents */}
                          {stepData?.documents && stepData.documents.length > 0 && (
                            <div className="mb-4">
                              <h6 className="text-sm font-medium text-gray-700 mb-2">Uploaded Documents</h6>
                              <div className="space-y-1">
                                {stepData.documents.map(doc => (
                                  <div key={doc.id} className="text-sm text-blue-600 hover:text-blue-800">
                                    📎 {doc.name}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Action Buttons - Only show if step can be acted upon */}
                          {canAction && status === 'in_progress' && (
                            <div className="space-y-3">
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  onClick={handleApprove}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Approve
                                </Button>
                                <Button
                                  onClick={() => setShowComments(step.id)}
                                  variant="secondary"
                                >
                                  Request Correction
                                </Button>
                              </div>
                              
                              {/* Rejection Section */}
                              <div className="border-t pt-3">
                                <h6 className="text-sm font-medium text-gray-700 mb-2">Reject Step</h6>
                                <textarea
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                  placeholder="Enter rejection reason..."
                                  className="w-full p-2 border border-gray-300 rounded text-sm mb-2"
                                  rows={2}
                                />
                                <Button
                                  onClick={handleReject}
                                  disabled={!rejectionReason.trim()}
                                  variant="secondary"
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  Reject
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Comments Section */}
                {showComments === step.id && (
                  <div className="mt-2 p-4 bg-gray-50 rounded border">
                    <h6 className="text-sm font-medium text-gray-700 mb-2">Add Comment</h6>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Enter your comment..."
                      className="w-full p-2 border border-gray-300 rounded text-sm mb-3"
                      rows={3}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={handleApprove}
                        disabled={!comment.trim()}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Approve with Comment
                      </Button>
                      <Button
                        onClick={handleRequestCorrection}
                        disabled={!comment.trim()}
                        variant="secondary"
                      >
                        Request Correction
                      </Button>
                      <Button
                        onClick={() => setShowComments(null)}
                        variant="secondary"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Workflow Summary */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Workflow Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded">
            <div className="text-2xl font-bold text-blue-600">
              {workflowDefinition.steps.length}
            </div>
            <div className="text-sm text-gray-600">Total Steps</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded">
            <div className="text-2xl font-bold text-green-600">
              {workflowDefinition.steps.filter(step => getStepStatus(step.id) === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded">
            <div className="text-2xl font-bold text-yellow-600">
              {workflowDefinition.steps.filter(step => getStepStatus(step.id) === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WorkflowVisualizer; 