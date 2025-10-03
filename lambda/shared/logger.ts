/**
 * LOGGER PARA LAMBDAS AWS
 * Logger simplificado para funções Lambda
 */

export class LambdaLogger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  log(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logMessage = {
      timestamp,
      level: 'LOG',
      context: this.context,
      message,
      data
    };
    console.log(JSON.stringify(logMessage));
  }

  error(message: string, error?: any) {
    const timestamp = new Date().toISOString();
    const logMessage = {
      timestamp,
      level: 'ERROR',
      context: this.context,
      message,
      error: error?.message || error,
      stack: error?.stack
    };
    console.error(JSON.stringify(logMessage));
  }

  warn(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logMessage = {
      timestamp,
      level: 'WARN',
      context: this.context,
      message,
      data
    };
    console.warn(JSON.stringify(logMessage));
  }

  debug(message: string, data?: any) {
    if (process.env.DEBUG === 'true') {
      const timestamp = new Date().toISOString();
      const logMessage = {
        timestamp,
        level: 'DEBUG',
        context: this.context,
        message,
        data
      };
      console.log(JSON.stringify(logMessage));
    }
  }
}