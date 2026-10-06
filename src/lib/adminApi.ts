import { supabase } from "@/integrations/supabase/client";

export class AdminApiError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
  }
}

type AdminAction =
  | "access"
  | "login"
  | "createAlbum"
  | "createUpload"
  | "createTracks"
  | "deleteAlbum";

export async function callAdminApi<T>(action: AdminAction, payload: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke("admin-api", {
    body: { action, ...payload },
  });

  if (error) {
    let message = "Admin request failed.";
    let status = 500;
    const context = (error as { context?: Response }).context;

    if (context) {
      status = context.status;
      try {
        const body = await context.clone().json() as { error?: string };
        message = body.error || message;
      } catch {
        message = error.message || message;
      }
    } else {
      message = error.message || message;
    }

    throw new AdminApiError(message, status);
  }

  return data as T;
}

export const isMfaRequired = (error: unknown) =>
  error instanceof AdminApiError && error.status === 403 && error.message === "Two-factor verification required.";
