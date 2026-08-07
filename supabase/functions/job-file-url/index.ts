// Creates a short-lived URL for one known job_files record.
// The browser never receives the service-role key and cannot request an
// arbitrary storage path. This function is local-tested only in Phase 1B.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
};

function response(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return response({ error: "Method not allowed" }, 405);

  const authorization = request.headers.get("Authorization");
  if (!authorization) return response({ error: "Authentication is required" }, 401);

  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anonKey || !serviceRoleKey) return response({ error: "Function is not configured" }, 500);

  let fileId = "";
  try {
    const body = await request.json();
    fileId = typeof body?.fileId === "string" ? body.fileId.trim() : "";
  } catch {
    return response({ error: "A JSON request body is required" }, 400);
  }
  if (!fileId) return response({ error: "fileId is required" }, 400);

  const caller = createClient(url, anonKey, {
    global: { headers: { Authorization: authorization } },
  });
  const { data: userData, error: userError } = await caller.auth.getUser();
  if (userError || !userData.user) return response({ error: "Invalid session" }, 401);

  const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false } });
  const { data: file, error: fileError } = await admin
    .from("job_files")
    .select("id, job_id, storage_path, archived_at")
    .eq("id", fileId)
    .maybeSingle();
  if (fileError) return response({ error: "Could not resolve the file" }, 500);
  if (!file || file.archived_at || !file.storage_path) return response({ error: "File not found" }, 404);

  const { data: permitted, error: permissionError } = await caller.rpc("can_access_job_files", {
    target_job_id: file.job_id,
    write_access: false,
  });
  if (permissionError) return response({ error: "Could not verify file access" }, 500);
  if (permitted !== true) return response({ error: "Not authorised for this file" }, 403);

  // Keep this fixed server-side. The browser supplies only a job_files ID and
  // cannot extend the lifetime of the signed URL.
  const expiresIn = 15 * 60;
  const { data: signed, error: signedError } = await admin.storage
    .from("job-files")
    .createSignedUrl(file.storage_path, expiresIn);
  if (signedError || !signed?.signedUrl) return response({ error: "Could not create a signed URL" }, 500);

  return response({ url: signed.signedUrl, expiresIn });
});
