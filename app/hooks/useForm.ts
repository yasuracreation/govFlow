
import { useState, useCallback, ChangeEvent } from 'react';

interface ValidationRules {
  required?: boolean;
  minLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null; // Custom validation function
}

// Use type alias for FormErrors for better type safety with mapped types
type FormErrors<T> = Partial<Record<keyof T, string | undefined>>;


interface UseFormReturn<T> {
  values: T;
  errors: FormErrors<T>;
  handleChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSubmit: (callback: (values: T) => void) => (event: React.FormEvent<HTMLFormElement>) => void;
  setValues: React.Dispatch<React.SetStateAction<T>>;
  setErrors: React.Dispatch<React.SetStateAction<FormErrors<T>>>;
  resetForm: () => void;
  validateField: (name: keyof T, value: any) => boolean; // Return boolean for validity
}

const useForm = <T extends Record<string, any>>(
  initialValues: T,
  validationRules?: Partial<Record<keyof T, ValidationRules>>
): UseFormReturn<T> => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});

  const validateField = useCallback((name: keyof T, value: any): boolean => {
    const rules = validationRules?.[name];
    let error: string | null = null;

    if (rules) {
      if (rules.required && (value === '' || value === false || value === undefined || value === null)) {
        error = 'This field is required.';
      } else if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
        error = `Minimum length is ${rules.minLength}.`;
      } else if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
        error = 'Invalid format.';
      } else if (rules.custom) {
        error = rules.custom(value);
      }
    }
    setErrors(prevErrors => ({ ...prevErrors, [name]: error ?? undefined }));
    return !error;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validationRules /* setErrors implicitly depends on component lifecycle, not values of errors */]);


  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = event.target;
    
    let processedValue: any = value;
    if (type === 'checkbox') {
        processedValue = (event.target as HTMLInputElement).checked;
    } else if (type === 'number') {
        processedValue = value === '' ? '' : Number(value); // Allow empty string for number inputs temporarily
    }

    setValues(prevValues => ({
      ...prevValues,
      [name]: processedValue,
    }));

    // Perform validation on change
    if (validationRules?.[name as keyof T]) {
      validateField(name as keyof T, processedValue);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validateField, validationRules]);

  const handleSubmit = (callback: (values: T) => void) => (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let isFormValid = true;
    const newErrors: FormErrors<T> = {};

    // Validate all fields defined in validationRules
    if (validationRules) {
        for (const fieldNameKey in validationRules) {
            const fieldName = fieldNameKey as keyof T;
            if (Object.prototype.hasOwnProperty.call(values, fieldName) || validationRules[fieldName]?.required) {
                if (!validateField(fieldName, values[fieldName])) {
                    isFormValid = false;
                    // validateField already sets the error state, but we capture for immediate check
                    // This newErrors object is more for if validateField was not updating state immediately enough.
                    // The primary check will be against the `errors` state after all validations run.
                }
            }
        }
    }
    
    // After all validateField calls (which update state `errors` asynchronously),
    // we need to check the accumulated `errors` state.
    // However, since `validateField` updates `errors` and returns validity synchronously,
    // `isFormValid` should reflect the overall status.
    // For an immediate check without relying on `errors` state being updated yet from all calls:
    let currentErrorsValid = true;
    Object.keys(validationRules || {}).forEach(key => {
        const fieldName = key as keyof T;
        const rules = validationRules?.[fieldName];
        let error: string | null = null;
        const value = values[fieldName];
        if (rules) {
            if (rules.required && (value === '' || value === false || value === undefined || value === null)) error = 'This field is required.';
            else if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) error = `Minimum length is ${rules.minLength}.`;
            else if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) error = 'Invalid format.';
            else if (rules.custom) error = rules.custom(value);
        }
        if (error) {
            newErrors[fieldName] = error;
            currentErrorsValid = false;
        }
    });


    if (isFormValid && currentErrorsValid) {
      // Check if any errors exist in the state (paranoid check, should align with isFormValid)
      const hasStateErrors = Object.values(errors).some(e => e !== undefined && e !== null);
      if(!hasStateErrors) {
          callback(values);
      } else {
        // This case implies state errors might not have cleared or async issue
        // Re-set errors to ensure UI updates if needed
        setErrors(prev => ({...prev, ...newErrors}));
        console.log("Form validation failed due to existing state errors or async validation lag.", errors, newErrors);
      }
    } else {
        // If isFormValid is false, set the errors collected from the sync pass
        setErrors(prev => ({...prev, ...newErrors}));
        console.log("Form validation failed", newErrors);
    }
  };
  
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues]);

  return { values, errors, handleChange, handleSubmit, setValues, setErrors, resetForm, validateField };
};

export default useForm;
