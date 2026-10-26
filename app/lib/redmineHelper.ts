type RedminePageResponse<T> = {
  total_count?: number;
  offset?: number;
  limit?: number;
  projects?: T[];
  issues?: T[];
  time_entries?: T[];
  memberships?: T[];
  time_entry_activities?: T[];
};

const REDMINE_TIMEOUT_MS = Number(process.env.REDMINE_TIMEOUT_MS || 30000);
const REDMINE_MAX_RETRIES = Number(process.env.REDMINE_MAX_RETRIES || 2);

function normalizeBaseUrl(input: string): string {
  return input.replace(/\/+$/, "");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableRedmineStatus(status: number) {
  return [408, 429, 500, 502, 503, 504].includes(status);
}

function isTimeoutLikeError(error: unknown) {
  const message = String((error as any)?.message || error || "");
  const name = String((error as any)?.name || "");
  return (
    name === "AbortError" ||
    /timed out/i.test(message) ||
    /aborted/i.test(message) ||
    /timeout/i.test(message)
  );
}

async function fetchWithTimeout(url: string, init: RequestInit) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REDMINE_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (isTimeoutLikeError(error)) {
      throw new Error(`Redmine request timed out after ${REDMINE_TIMEOUT_MS}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export function getRedmineConfig() {
  const baseUrl = String(process.env.REDMINE_BASE_URL || "").trim();
  const apiKey = String(process.env.REDMINE_API_KEY || "").trim();

  if (!baseUrl || !apiKey) {
    throw new Error("REDMINE_BASE_URL / REDMINE_API_KEY belum diset di environment");
  }

  return {
    baseUrl: normalizeBaseUrl(baseUrl),
    apiKey,
  };
}

async function redmineGetJson<T>(pathWithQuery: string): Promise<T> {
  const cfg = getRedmineConfig();
  const url = `${cfg.baseUrl}${pathWithQuery.startsWith("/") ? "" : "/"}${pathWithQuery}`;

  for (let attempt = 0; attempt <= REDMINE_MAX_RETRIES; attempt += 1) {
    try {
      const rsp = await fetchWithTimeout(url, {
        method: "GET",
        headers: {
          "X-Redmine-API-Key": cfg.apiKey,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!rsp.ok) {
        const body = await rsp.text();
        if (attempt < REDMINE_MAX_RETRIES && isRetryableRedmineStatus(rsp.status)) {
          await sleep(1000 * (attempt + 1));
          continue;
        }
        throw new Error(`Redmine request failed (${rsp.status}): ${body || rsp.statusText}`);
      }

      return (await rsp.json()) as T;
    } catch (error) {
      if (attempt < REDMINE_MAX_RETRIES && isTimeoutLikeError(error)) {
        await sleep(1000 * (attempt + 1));
        continue;
      }
      throw error;
    }
  }

  throw new Error("Redmine request failed after retries");
}

async function redmineWriteJson<T>(
  pathWithQuery: string,
  method: "PUT" | "POST",
  body: any,
  extraHeaders?: Record<string, string>
): Promise<T> {
  const cfg = getRedmineConfig();
  const url = `${cfg.baseUrl}${pathWithQuery.startsWith("/") ? "" : "/"}${pathWithQuery}`;
  const rsp = await fetch(url, {
    method,
    headers: {
      "X-Redmine-API-Key": cfg.apiKey,
      "Content-Type": "application/json",
      ...(extraHeaders || {}),
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!rsp.ok) {
    const text = await rsp.text();
    throw new Error(`Redmine ${method} failed (${rsp.status}): ${text || rsp.statusText}`);
  }

  if (rsp.status === 204) return {} as T;
  return (await rsp.json()) as T;
}

export async function getAllRedmineProjects() {
  const limit = 100;
  const rows: any[] = [];

  for (const status of [1, 5]) {
    let offset = 0;

    while (true) {
      const query = `/projects.json?limit=${limit}&offset=${offset}&status=${status}`;
      const json = await redmineGetJson<RedminePageResponse<any>>(query);
      const list = Array.isArray(json.projects) ? json.projects : [];
      rows.push(...list);

      const total = Number(json.total_count || rows.length);
      offset += limit;
      if (offset >= total || list.length === 0) break;
    }
  }

  return Array.from(
    new Map(
      rows.map((project) => [Number(project?.id), project])
    ).values()
  );
}

export async function getAllRedmineIssueStatuses() {
  const json = await redmineGetJson<{ issue_statuses?: any[] }>(
    `/issue_statuses.json`
  );
  return Array.isArray(json.issue_statuses) ? json.issue_statuses : [];
}

export async function getAllRedmineIssues(projectId?: number) {
  const limit = 100;
  let offset = 0;
  const rows: any[] = [];

  while (true) {
    const query = `/issues.json?limit=${limit}&offset=${offset}&status_id=*${
      projectId && !isNaN(projectId) ? `&project_id=${projectId}` : ""
    }`;
    const json = await redmineGetJson<RedminePageResponse<any>>(query);
    const list = Array.isArray(json.issues) ? json.issues : [];
    rows.push(...list);

    const total = Number(json.total_count || rows.length);
    offset += limit;
    if (rows.length >= total || list.length === 0) break;
  }

  return rows;
}

export async function getAllRedmineTimeEntries(projectId?: number) {
  const limit = 100;
  let offset = 0;
  const rows: any[] = [];

  while (true) {
    const query = `/time_entries.json?limit=${limit}&offset=${offset}${
      projectId && !isNaN(projectId) ? `&project_id=${projectId}` : ""
    }`;
    const json = await redmineGetJson<RedminePageResponse<any>>(query);
    const list = Array.isArray(json.time_entries) ? json.time_entries : [];
    rows.push(...list);

    const total = Number(json.total_count || rows.length);
    offset += limit;
    if (rows.length >= total || list.length === 0) break;
  }

  return rows;
}

export async function getRedmineProjectById(projectId: number) {
  const json = await redmineGetJson<{ project?: any }>(
    `/projects/${projectId}.json`
  );
  return json?.project || null;
}

export async function getRedmineProjectMemberships(projectId: number) {
  const json = await redmineGetJson<RedminePageResponse<any>>(
    `/projects/${projectId}/memberships.json`
  );
  return Array.isArray(json.memberships) ? json.memberships : [];
}

export async function getRedmineIssueById(issueId: number) {
  const json = await redmineGetJson<{ issue?: any }>(`/issues/${issueId}.json`);
  return json?.issue || null;
}

export async function getRedmineIssueWithJournalsById(issueId: number) {
  const json = await redmineGetJson<{ issue?: any }>(
    `/issues/${issueId}.json?include=journals`
  );
  return json?.issue || null;
}

export async function getRedmineIssueWithJournalsAndAttachmentsById(issueId: number) {
  const json = await redmineGetJson<{ issue?: any }>(
    `/issues/${issueId}.json?include=journals,attachments`
  );
  return json?.issue || null;
}

export async function getRedmineIssueDetailForKanbanById(issueId: number) {
  const json = await redmineGetJson<{ issue?: any }>(
    `/issues/${issueId}.json?include=journals,attachments,allowed_statuses`
  );
  return json?.issue || null;
}

export async function updateRedmineIssueStatus(issueId: number, statusId: number) {
  await redmineWriteJson(`/issues/${issueId}.json`, "PUT", {
    issue: {
      status_id: statusId,
    },
  });
  return getRedmineIssueById(issueId);
}

export async function updateRedmineIssueStatusAsUser(
  issueId: number,
  statusId: number,
  switchUserLogin?: string | null
) {
  await redmineWriteJson(
    `/issues/${issueId}.json`,
    "PUT",
    {
      issue: {
        status_id: statusId,
      },
    },
    switchUserLogin
      ? {
          "X-Redmine-Switch-User": switchUserLogin,
        }
      : undefined
  );
  return getRedmineIssueById(issueId);
}

export async function updateRedmineIssueAssigneeAsUser(
  issueId: number,
  assigneeId: number,
  switchUserLogin?: string | null
) {
  await redmineWriteJson(
    `/issues/${issueId}.json`,
    "PUT",
    {
      issue: {
        assigned_to_id: assigneeId,
      },
    },
    switchUserLogin
      ? {
          "X-Redmine-Switch-User": switchUserLogin,
        }
      : undefined
  );
  return getRedmineIssueById(issueId);
}

export async function addRedmineIssueNote(
  issueId: number,
  notes: string,
  switchUserLogin?: string | null,
  uploads?: {
    token: string;
    filename: string;
    contentType?: string | null;
  }[]
) {
  await redmineWriteJson(
    `/issues/${issueId}.json`,
    "PUT",
    {
      issue: {
        notes,
        ...(Array.isArray(uploads) && uploads.length > 0
          ? {
              uploads: uploads.map((item) => ({
                token: item.token,
                filename: item.filename,
                ...(item.contentType ? { content_type: item.contentType } : {}),
              })),
            }
          : {}),
      },
    },
    switchUserLogin
      ? {
          "X-Redmine-Switch-User": switchUserLogin,
        }
      : undefined
  );
  return getRedmineIssueWithJournalsAndAttachmentsById(issueId);
}

export async function uploadRedmineAttachment(
  input: {
    filename: string;
    contentType?: string | null;
    buffer: ArrayBuffer;
  },
  switchUserLogin?: string | null
) {
  const cfg = getRedmineConfig();
  const filename = String(input.filename || "attachment").trim() || "attachment";
  const url = `${cfg.baseUrl}/uploads.json?filename=${encodeURIComponent(filename)}`;
  const rsp = await fetch(url, {
    method: "POST",
    headers: {
      "X-Redmine-API-Key": cfg.apiKey,
      // Redmine upload endpoint expects raw binary payload.
      "Content-Type": "application/octet-stream",
      Accept: "application/json",
      ...(switchUserLogin
        ? {
            "X-Redmine-Switch-User": switchUserLogin,
          }
        : {}),
    },
    body: Buffer.from(input.buffer),
    cache: "no-store",
  });

  if (!rsp.ok) {
    const text = await rsp.text();
    throw new Error(`Redmine attachment upload failed (${rsp.status}): ${text || rsp.statusText}`);
  }

  const json = (await rsp.json()) as { upload?: { token?: string } };
  const token = String(json?.upload?.token || "").trim();
  if (!token) {
    throw new Error("Redmine attachment upload token is missing");
  }

  return {
    token,
    filename,
    contentType: String(input.contentType || "").trim() || null,
  };
}

export async function getRedmineTimeEntryActivities() {
  const json = await redmineGetJson<RedminePageResponse<any>>(
    `/enumerations/time_entry_activities.json`
  );
  return Array.isArray(json.time_entry_activities) ? json.time_entry_activities : [];
}

export async function createRedmineTimeEntry(
  input: {
    issueId: number;
    projectId?: number | null;
    hours: number;
    spentOn: string;
    comments?: string;
    activityId?: number | null;
  },
  switchUserLogin?: string | null
) {
  return await redmineWriteJson<{ time_entry?: any }>(
    `/time_entries.json`,
    "POST",
    {
      time_entry: {
        issue_id: input.issueId,
        ...(input.projectId ? { project_id: input.projectId } : {}),
        hours: input.hours,
        spent_on: input.spentOn,
        ...(input.comments ? { comments: input.comments } : {}),
        ...(input.activityId ? { activity_id: input.activityId } : {}),
      },
    },
    switchUserLogin
      ? {
          "X-Redmine-Switch-User": switchUserLogin,
        }
      : undefined
  );
}

export async function getRedmineProjectByCode(projectCode: string) {
  const code = String(projectCode || "").trim().toLowerCase();
  if (!code) return null;
  const projects = await getAllRedmineProjects();
  return (
    projects.find((project: any) => {
      const identifier = String(project?.identifier || "").trim().toLowerCase();
      if (identifier === code) return true;

      const customFields = Array.isArray(project?.custom_fields)
        ? project.custom_fields
        : [];
      const projectCodeField = customFields.find(
        (field: any) =>
          String(field?.name || "").trim().toLowerCase() === "project code"
      );
      const customValue = String(projectCodeField?.value || "")
        .trim()
        .toLowerCase();
      return customValue === code;
    }) || null
  );
}

export function extractRedmineIdentifierFromUrl(projectUrl: string): string | null {
  const raw = String(projectUrl || "").trim();
  if (!raw) return null;

  try {
    const url = new URL(raw);
    const match = url.pathname.match(/\/projects\/([^/]+)\/?$/i);
    if (!match?.[1]) return null;
    return decodeURIComponent(match[1]).trim() || null;
  } catch (error) {
    return null;
  }
}

export async function getAllRedmineUsers() {
  const limit = 100;
  let offset = 0;
  const rows: any[] = [];

  while (true) {
    const query = `/users.json?limit=${limit}&offset=${offset}&status=*`;
    const json = await redmineGetJson<RedminePageResponse<any>>(query);
    const list = Array.isArray((json as any).users) ? (json as any).users : [];
    rows.push(...list);

    const total = Number(json.total_count || rows.length);
    offset += limit;
    if (rows.length >= total || list.length === 0) break;
  }

  return rows;
}

export function toNullableDate(value: any): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}
