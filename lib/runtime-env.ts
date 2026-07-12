import { AsyncLocalStorage } from "node:async_hooks";

export interface EventRuntimeEnv {
  DB: D1Database;
  BUCKET: {
    put(key:string,value:ArrayBuffer,options?:{httpMetadata?:{contentType?:string}}):Promise<unknown>;
    get(key:string):Promise<{body:ReadableStream;httpMetadata?:{contentType?:string}}|null>;
    delete(key:string|string[]):Promise<void>;
  };
  ADMIN_EMAILS?: string;
  ADMIN_NOTIFICATION_EMAILS?: string;
  RESEND_API_KEY?: string;
  NOTIFICATION_FROM_EMAIL?: string;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

const storage=new AsyncLocalStorage<EventRuntimeEnv>();
export function runWithRuntimeEnv<T>(env:EventRuntimeEnv,callback:()=>T):T{return storage.run(env,callback)}
export function getRuntimeEnv():EventRuntimeEnv{const value=storage.getStore();if(!value)throw new Error("Event runtime bindings are unavailable.");return value}
