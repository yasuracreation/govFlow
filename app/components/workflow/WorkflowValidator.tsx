import React from 'react';
import { useTranslation } from 'react-i18next';
import { WorkflowDefinition, WorkflowStepDefinition } from '../../types';

interface ValidationError {
  type: 'error' | 'warning' | 'info';
  message: string;
  stepId?: string;
  fieldId?: string;
}

interface WorkflowValidatorProps {
  workflow: WorkflowDefinition;
  onValidationComplete: (errors: ValidationError[]) => void;
}

const WorkflowValidator: React.FC<WorkflowValidatorProps> = ({
  workflow,
  onValidationComplete
}) => {
  const { t } = useTranslation();
  const [validationErrors, setValidationErrors] = React.useState<ValidationError[]>([]);
  const [isValidating, setIsValidating] = React.useState(false);

  const validateWorkflow = React.useCallback(() => {
    setIsValidating(true);
    const errors: ValidationError[] = [];

    // Basic workflow validation
    if (!workflow.name.trim()) {
      errors.push({
        type: 'error',
        message: 'Workflow name is required'
      });
    }

    if (!workflow.serviceCategoryId) {
      errors.push({
        type: 'error',
        message: 'Service category is required'
      });
    }

    if (workflow.steps.length === 0) {
      errors.push({
        type: 'error',
        message: 'At least one step is required'
      });
    }

    // Step validation
    workflow.steps.forEach((step, index) => {
      if (!step.name.trim()) {
        errors.push({
          type: 'error',
          message: `Step ${index + 1}: Name is required`,
          stepId: step.id
        });
      }

      if (step.estimatedDuration && step.estimatedDuration <= 0) {
        errors.push({
          type: 'error',
          message: `Step ${index + 1}: Estimated duration must be greater than 0`,
          stepId: step.id
        });
      }

      if (step.estimatedDuration && step.estimatedDuration > 720) {
        errors.push({
          type: 'warning',
          message: `Step ${index + 1}: Estimated duration is very long (${step.estimatedDuration} hours)`,
          stepId: step.id
        });
      }

      // Form field validation
      step.formFields.forEach((field, fieldIndex) => {
        if (!field.label.trim()) {
          errors.push({
            type: 'error',
            message: `Step ${index + 1}, Field ${fieldIndex + 1}: Label is required`,
            stepId: step.id,
            fieldId: field.id
          });
        }

        if (!field.name.trim()) {
          errors.push({
            type: 'error',
            message: `Step ${index + 1}, Field ${fieldIndex + 1}: Field name is required`,
            stepId: step.id,
            fieldId: field.id
          });
        }

        // Check for duplicate field names within the same step
        const duplicateFields = step.formFields.filter(f => f.name === field.name);
        if (duplicateFields.length > 1) {
          errors.push({
            type: 'error',
            message: `Step ${index + 1}: Duplicate field name "${field.name}"`,
            stepId: step.id,
            fieldId: field.id
          });
        }
      });

      // Check for approval type consistency
      if (step.approvalType === 'DepartmentHead' && index < workflow.steps.length - 1) {
        const hasSectionHeadAfter = workflow.steps.slice(index + 1).some(s => s.approvalType === 'SectionHead');
        if (hasSectionHeadAfter) {
          errors.push({
            type: 'warning',
            message: `Step ${index + 1}: Department Head approval should typically be the final step`,
            stepId: step.id
          });
        }
      }
    });

    // Workflow structure validation
    const approvalSteps = workflow.steps.filter(s => s.approvalType !== 'None');
    if (approvalSteps.length === 0) {
      errors.push({
        type: 'info',
        message: 'No approval steps defined. Consider adding approval steps for important decisions.'
      });
    }

    // Check for parallel steps
    const parallelSteps = workflow.steps.filter(s => s.isParallel);
    if (parallelSteps.length > 0) {
      errors.push({
        type: 'info',
        message: `${parallelSteps.length} step(s) can run in parallel. Ensure proper coordination.`
      });
    }

    // Check workflow length
    if (workflow.steps.length > 10) {
      errors.push({
        type: 'warning',
        message: 'Workflow has many steps. Consider breaking it into smaller workflows.'
      });
    }

    setValidationErrors(errors);
    onValidationComplete(errors);
    setIsValidating(false);
  }, [workflow, onValidationComplete]);

  React.useEffect(() => {
    validateWorkflow();
  }, [validateWorkflow]);

  const getErrorIcon = (type: ValidationError['type']) => {
    switch (type) {
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getErrorColor = (type: ValidationError['type']) => {
    switch (type) {
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
    }
  };

  const errorCount = validationErrors.filter(e => e.type === 'error').length;
  const warningCount = validationErrors.filter(e => e.type === 'warning').length;
  const infoCount = validationErrors.filter(e => e.type === 'info').length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Workflow Validation</h3>
        <button
          onClick={validateWorkflow}
          disabled={isValidating}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isValidating ? 'Validating...' : 'Revalidate'}
        </button>
      </div>

      {/* Validation Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{errorCount}</div>
          <div className="text-sm text-red-600">Errors</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
          <div className="text-sm text-yellow-600">Warnings</div>
        </div>
        <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{infoCount}</div>
          <div className="text-sm text-blue-600">Info</div>
        </div>
      </div>

      {/* Validation Results */}
      {validationErrors.length === 0 ? (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h4 className="mt-2 text-lg font-medium text-gray-900">Workflow is valid!</h4>
          <p className="mt-1 text-sm text-gray-500">All validation checks have passed.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {validationErrors.map((error, index) => (
            <div
              key={index}
              className={`flex items-start space-x-3 p-3 border rounded-lg ${getErrorColor(error.type)}`}
            >
              {getErrorIcon(error.type)}
              <div className="flex-1">
                <p className="text-sm text-gray-900">{error.message}</p>
                {error.stepId && (
                  <p className="text-xs text-gray-500 mt-1">
                    Step ID: {error.stepId}
                    {error.fieldId && ` | Field ID: ${error.fieldId}`}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Validation Tips */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Validation Tips:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Ensure each step has a descriptive name and appropriate approval type</li>
          <li>• Set realistic estimated durations for each step</li>
          <li>• Consider adding approval steps for important decisions</li>
          <li>• Keep workflows focused and avoid too many steps</li>
          <li>• Test parallel steps to ensure proper coordination</li>
        </ul>
      </div>
    </div>
  );
};

export default WorkflowValidator; 