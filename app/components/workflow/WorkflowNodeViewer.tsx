import React, { useState, useEffect } from 'react';
import { ServiceRequest, WorkflowDefinition, WorkflowNode, UploadedDocument } from '@/types';
import Card from '../common/Card';
import Button from '../common/Button';
import { CheckCircle, XCircle, Clock, AlertCircle, Download, Eye, MessageSquare, FileText } from 'lucide-react';

interface WorkflowNodeViewerProps {
  serviceRequest: ServiceRequest;
  workflowDefinition: WorkflowDefinition;
  onApprove: (stepId: string, comment?: string) => void;
  onReject: (stepId: string, reason: string) => void;
  onRequestCorrection: (stepId: string, comment: string) => void;
  onGenerateApprovalDocument: (stepId: string) => void;
}

const WorkflowNodeViewer: React.FC<WorkflowNodeViewerProps> = ({
  serviceRequest,
  workflowDefinition,
  onApprove,
  onReject,
  onRequestCorrection,
  onGenerateApprovalDocument
}) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [comment, setComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [correctionComment, setCorrectionComment] = useState('');

  const getNodeStatus = (stepId: string) => {
    const stepHistory = serviceRequest.history.find(h => h.stepId === stepId);
    if (!stepHistory) return 'pending';
    
    if (stepHistory.action.includes('Rejected')) return 'rejected';
    if (stepHistory.action.includes('Approved')) return 'completed';
    if (stepHistory.action.includes('Correction')) return 'correction_requested';
    if (stepHistory.action.includes('Submitted')) return 'in_progress';
    
    return 'pending';
  };

  const getNodeIcon = (status: string) => {
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

  const getNodeColor = (status: string, isSelected: boolean) => {
    if (isSelected) return 'border-blue-500 bg-blue-50 shadow-lg';
    
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-50 hover:bg-green-100';
      case 'rejected':
        return 'border-red-500 bg-red-50 hover:bg-red-100';
      case 'in_progress':
        return 'border-blue-500 bg-blue-50 hover:bg-blue-100';
      case 'correction_requested':
        return 'border-orange-500 bg-orange-50 hover:bg-orange-100';
      default:
        return 'border-gray-300 bg-gray-50 hover:bg-gray-100';
    }
  };

  const getStepData = (stepId: string) => {
    return serviceRequest.history.find(h => h.stepId === stepId);
  };

  const handleNodeClick = (stepId: string) => {
    setSelectedNode(selectedNode === stepId ? null : stepId);
  };

  const handleApprove = () => {
    if (selectedNode && onApprove) {
      onApprove(selectedNode, comment);
      setComment('');
      setShowApprovalModal(false);
    }
  };

  const handleReject = () => {
    if (selectedNode && rejectionReason && onReject) {
      onReject(selectedNode, rejectionReason);
      setRejectionReason('');
      setShowRejectionModal(false);
    }
  };

  const handleRequestCorrection = () => {
    if (selectedNode && correctionComment && onRequestCorrection) {
      onRequestCorrection(selectedNode, correctionComment);
      setCorrectionComment('');
      setShowCorrectionModal(false);
    }
  };

  const handleGenerateDocument = () => {
    if (selectedNode && onGenerateApprovalDocument) {
      onGenerateApprovalDocument(selectedNode);
    }
  };

  return (
    <div className="space-y-6">
      {/* Workflow Header */}
      <Card>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Workflow: {workflowDefinition.name}</h2>
            <p className="text-gray-600">Request ID: {serviceRequest.id}</p>
            <p className="text-sm text-gray-500">
              Citizen: {serviceRequest.serviceRequestData.citizenName} | 
              NIC: {serviceRequest.serviceRequestData.nicNumber}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Overall Status</div>
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

      {/* Node-based Workflow Visualization */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Workflow Steps</h3>
        <div className="relative">
          {/* Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {workflowDefinition.steps.map((step, index) => {
              if (index < workflowDefinition.steps.length - 1) {
                const currentY = 60 + (index * 120);
                const nextY = 60 + ((index + 1) * 120);
                return (
                  <line
                    key={`line-${step.id}`}
                    x1="50%"
                    y1={currentY}
                    x2="50%"
                    y2={nextY}
                    stroke="#d1d5db"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                );
              }
              return null;
            })}
          </svg>

          {/* Workflow Nodes */}
          <div className="relative z-10 space-y-6">
            {workflowDefinition.steps.map((step, index) => {
              const status = getNodeStatus(step.id);
              const stepData = getStepData(step.id);
              const isSelected = selectedNode === step.id;
              const isCurrentStep = serviceRequest.currentStepId === step.id;

              return (
                <div key={step.id} className="flex justify-center">
                  <div
                    className={`w-80 p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${getNodeColor(status, isSelected)}`}
                    onClick={() => handleNodeClick(step.id)}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      {getNodeIcon(status)}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          Step {index + 1}: {step.name}
                          {isCurrentStep && (
                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Current
                            </span>
                          )}
                        </h4>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                      <div>Status: {status.replace('_', ' ')}</div>
                      <div>Duration: {step.estimatedDuration || 'N/A'}h</div>
                      {stepData && (
                        <>
                          <div>Updated: {new Date(stepData.timestamp).toLocaleDateString()}</div>
                          <div>By: {stepData.userName}</div>
                        </>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {isSelected && (
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <div className="flex space-x-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowApprovalModal(true);
                            }}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowRejectionModal(true);
                            }}
                            size="sm"
                            variant="secondary"
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowCorrectionModal(true);
                            }}
                            size="sm"
                            variant="secondary"
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Request Correction
                          </Button>
                          {status === 'completed' && (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGenerateDocument();
                              }}
                              size="sm"
                              variant="secondary"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Generate Document
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Selected Node Details */}
      {selectedNode && (() => {
        const step = workflowDefinition.steps.find(s => s.id === selectedNode);
        const stepData = getStepData(selectedNode);
        const status = getNodeStatus(selectedNode);

        return (
          <Card>
            <h3 className="text-lg font-semibold mb-4">Step Details: {step?.name}</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form Data */}
              {stepData?.data && Object.keys(stepData.data).length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Form Data
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {Object.entries(stepData.data).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="font-medium text-gray-700">{key}:</span>
                        <span className="text-gray-900">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents */}
              {stepData?.documents && stepData.documents.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    Uploaded Documents
                  </h4>
                  <div className="space-y-2">
                    {stepData.documents.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-700">{doc.name}</span>
                        </div>
                        <Button size="sm" variant="secondary">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Step History */}
            {stepData && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Step History</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{stepData.action}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(stepData.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">By: {stepData.userName}</div>
                  {stepData.comment && (
                    <div className="mt-2 text-sm text-gray-700">
                      <span className="font-medium">Comment:</span> {stepData.comment}
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        );
      })()}

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Approve Step</h3>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add approval comment (optional)..."
              className="w-full p-3 border border-gray-300 rounded-lg mb-4"
              rows={3}
            />
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setShowApprovalModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                Approve
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Reject Step</h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Provide rejection reason..."
              className="w-full p-3 border border-gray-300 rounded-lg mb-4"
              rows={3}
              required
            />
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setShowRejectionModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleReject} 
                disabled={!rejectionReason.trim()}
                className="bg-red-600 hover:bg-red-700"
              >
                Reject
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Correction Request Modal */}
      {showCorrectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Request Correction</h3>
            <textarea
              value={correctionComment}
              onChange={(e) => setCorrectionComment(e.target.value)}
              placeholder="Describe what needs to be corrected..."
              className="w-full p-3 border border-gray-300 rounded-lg mb-4"
              rows={3}
              required
            />
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setShowCorrectionModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleRequestCorrection} 
                disabled={!correctionComment.trim()}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Request Correction
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WorkflowNodeViewer; 