// types/common/common.types.ts

// Respuestas API
export interface ApiResponse<T=unknown>{
	success: boolean;
	message?:string;
	data?:T;
	error?:string;
	details?:unknown;
	stack?:string;
	timestamp:string;
}

// Entornos y niveles de log
export enum NodeEnv {
	Development = 'development',
	Production = 'production',
	Test = 'test'
}

export enum LogLevel {
	Debug = 'debug',
	Info = 'info',
	Warn = 'warn',
	Error = 'error'
}
