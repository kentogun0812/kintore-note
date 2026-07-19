import { Alert } from 'react-native';
import i18next from 'i18next';

export enum ErrorType {
  SYSTEM = 'SYSTEM',
  NETWORK = 'NETWORK',
  DATABASE = 'DATABASE',
  VALIDATION = 'VALIDATION',
  BUSINESS = 'BUSINESS',
}

export class AppError extends Error {
  type: ErrorType;
  code?: string;
  originalError?: any;

  constructor(type: ErrorType, message: string, code?: string, originalError?: any) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.code = code;
    this.originalError = originalError;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class BusinessError extends AppError {
  constructor(message: string, code?: string, originalError?: any) {
    super(ErrorType.BUSINESS, message, code, originalError);
    this.name = 'BusinessError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, code?: string, originalError?: any) {
    super(ErrorType.VALIDATION, message, code, originalError);
    this.name = 'ValidationError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, code?: string, originalError?: any) {
    super(ErrorType.DATABASE, message, code, originalError);
    this.name = 'DatabaseError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string, code?: string, originalError?: any) {
    super(ErrorType.NETWORK, message, code, originalError);
    this.name = 'NetworkError';
  }
}

export class SystemError extends AppError {
  constructor(message: string, code?: string, originalError?: any) {
    super(ErrorType.SYSTEM, message, code, originalError);
    this.name = 'SystemError';
  }
}

export const AppErrorHandler = {
  handleError(error: any): void {
    let appError: AppError;

    if (error instanceof AppError) {
      appError = error;
    } else if (error instanceof Error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('sqlite') || msg.includes('constraint') || msg.includes('database')) {
        appError = new DatabaseError(error.message, undefined, error);
      } else if (msg.includes('network') || msg.includes('fetch') || msg.includes('timeout') || msg.includes('failed to fetch')) {
        appError = new NetworkError(error.message, undefined, error);
      } else {
        appError = new SystemError(error.message, undefined, error);
      }
    } else {
      appError = new SystemError(typeof error === 'string' ? error : 'Unknown error occurred', undefined, error);
    }

    // 1. Silent logging for debugging (using console.log to prevent React Native LogBox from intercepting as fatal red screen)
    if (appError.type === ErrorType.SYSTEM || appError.type === ErrorType.DATABASE || appError.type === ErrorType.NETWORK) {
      console.log(`[AppErrorHandler] [${appError.type}] (Technical Error) Code: ${appError.code || 'N/A'} - Message: ${appError.message}`, appError.originalError || appError);
    } else {
      console.log(`[AppErrorHandler] [${appError.type}] Code: ${appError.code || 'N/A'} - Message: ${appError.message}`);
    }

    // 2. User presentation logic:
    // ONLY display alert for BusinessError or ValidationError.
    // System, Network, and Database errors are logged silently to the console so UI remains unbroken.
    if (appError.type === ErrorType.BUSINESS || appError.type === ErrorType.VALIDATION) {
      Alert.alert(
        i18next.t('common.error', 'Error'),
        appError.message
      );
    }
  }
};
