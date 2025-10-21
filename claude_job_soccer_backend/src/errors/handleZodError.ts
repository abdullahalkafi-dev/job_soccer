import { ZodError, ZodIssue } from "zod";
import { TErrorSources, TGenericErrorResponse } from "../shared/types/error";

// Helper function to generate user-friendly error messages
const generateUserFriendlyMessage = (issue: ZodIssue): string => {
  const fieldName = issue?.path[issue.path.length - 1] || "Field";
  
  // Format field name: convert camelCase to Title Case with spaces
  const formattedFieldName = String(fieldName)
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .toLowerCase()
    .replace(/^./, str => str.toUpperCase());

  switch (issue.code) {
    case "invalid_type": {
      // In Zod 4, access received and expected through 'input' and 'expected' properties
      const received = (issue as any).input;
      const expected = (issue as any).expected;
      
      if (received === undefined || received === null) {
        return `${formattedFieldName} is required`;
      }
      
      // Map technical types to user-friendly terms
      const typeMap: Record<string, string> = {
        string: "text",
        number: "number",
        boolean: "true/false value",
        array: "list",
        object: "valid data",
        date: "date",
      };
      
      const expectedType = typeMap[expected] || expected;
      const receivedType = typeof received === "object" ? "object" : typeof received;
      const friendlyReceivedType = typeMap[receivedType] || receivedType;
      
      return `${formattedFieldName} must be a ${expectedType}, but received ${friendlyReceivedType}`;
    }
    
    case "invalid_format": {
      // In Zod 4, 'invalid_string' was replaced with 'invalid_format'
      const format = (issue as any).format;
      
      if (format === "email") {
        return `${formattedFieldName} must be a valid email address`;
      }
      if (format === "url") {
        return `${formattedFieldName} must be a valid URL`;
      }
      if (format === "uuid") {
        return `${formattedFieldName} must be a valid UUID`;
      }
      return `${formattedFieldName} format is invalid`;
    }
    
    case "too_small": {
      const minimum = (issue as any).minimum;
      const kind = (issue as any).kind;
      
      if (kind === "string") {
        return `${formattedFieldName} must be at least ${minimum} characters long`;
      }
      if (kind === "number") {
        return `${formattedFieldName} must be at least ${minimum}`;
      }
      if (kind === "array") {
        return `${formattedFieldName} must contain at least ${minimum} item(s)`;
      }
      return `${formattedFieldName} is too small`;
    }
    
    case "too_big": {
      const maximum = (issue as any).maximum;
      const kind = (issue as any).kind;
      
      if (kind === "string") {
        return `${formattedFieldName} must be at most ${maximum} characters long`;
      }
      if (kind === "number") {
        return `${formattedFieldName} must be at most ${maximum}`;
      }
      if (kind === "array") {
        return `${formattedFieldName} must contain at most ${maximum} item(s)`;
      }
      return `${formattedFieldName} is too large`;
    }
    
    case "invalid_value": {
      // In Zod 4, 'invalid_enum_value' was replaced with 'invalid_value'
      const options = (issue as any).options;
      if (options) {
        return `${formattedFieldName} must be one of: ${options.join(", ")}`;
      }
      return `${formattedFieldName} has an invalid value`;
    }
    
    case "unrecognized_keys": {
      const keys = (issue as any).keys;
      return `Unrecognized field(s): ${keys?.join(", ")}`;
    }
    
    case "custom":
      return issue.message || `${formattedFieldName} is invalid`;
    
    default:
      // Fallback to the original message if we don't have a specific handler
      return issue.message;
  }
};

const handleZodError = (err: ZodError): TGenericErrorResponse => {
  const errorSources: TErrorSources = err.issues.map((issue: ZodIssue) => {
    const pathValue = issue?.path[issue.path.length - 1];
    return {
      path: typeof pathValue === 'symbol' ? String(pathValue) : (pathValue as string | number),
      message: generateUserFriendlyMessage(issue),
    };
  });

  const statusCode = 400;

  // Generate a meaningful message based on the number of errors
  let message: string;
  if (errorSources.length === 1) {
    // Single error: use the error message directly
    message = errorSources[0].message;
  } else if (errorSources.length === 2) {
    // Two errors: mention both fields
    message = `Invalid input for ${errorSources.map(e => e.path).join(' and ')}`;
  } else {
    // Multiple errors: provide a count
    message = `${errorSources.length} validation errors found. Please check your input.`;
  }

  return {
    statusCode,
    message,
    errorSources,
  };
};

export default handleZodError;
