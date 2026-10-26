type ProjectCustomFieldLike = {
  fieldName?: string | null;
  fieldValue?: string | null;
};

type ProjectTaskLike = {
  trackerId?: number | null;
  statusId?: number | null;
  statusName?: string | null;
  subject?: string | null;
  dueDate?: Date | string | null;
};

const OVERDUE_TASK_STATUS_ID_SET = new Set([17, 3, 4, 19]);
const EXCLUDED_TASK_STATUS_ID_SET = new Set([6]);

type RedmineProjectProgressInput = {
  projectStatus?: number | null;
  previousCurrentStatus?: string | null;
  customFields: ProjectCustomFieldLike[];
  tasks: ProjectTaskLike[];
  today?: Date;
};

type RedmineProjectProgressResult = {
  currentStatus: string;
  analystDesignProgress: number;
  developmentProgress: number;
  qaProgress: number;
  sitProgress: number;
  uatProgress: number;
  productionProgress: number;
  severity: number;
};

const ANALYSIS_TRACKER_ID = 15;
const DELIVERY_TRACKER_ID = 6;
const ANALYSIS_PROGRESS_STATUSES = [19, 21, 22];
const ANALYSIS_DONE_STATUS_ID = 22;
const DEVELOPMENT_DONE_STATUSES = [16, 4, 11, 10, 26, 27, 28, 7, 24, 19, 21, 22];
const DEVELOPMENT_PROGRESS_STATUSES = [11, 10, 26, 27, 28, 7, 24, 16, 4, 19, 21, 22];
const QA_DONE_STATUSES = [7, 24, 11, 10, 26, 27, 28, 19, 21, 22];
const QA_PROGRESS_STATUSES = [11, 10, 26, 27, 28, 19, 21, 22];
const QA_DONE_STATUS_ID = 7;
const QA_SEVERITY_DONE_STATUS_ID = 24;
const SIT_DONE_STATUSES = [27, 28, 11, 10, 26, 19, 21, 22];
const SIT_PROGRESS_STATUSES = [11, 10, 26, 19, 21, 22];
const SIT_DONE_STATUS_ID = 28;
const UAT_DONE_STATUSES = [10, 26, 11, 19, 21, 22];
const UAT_PROGRESS_STATUSES = [11, 19, 21, 22];
const UAT_DONE_STATUS_ID = 26;
const PRODUCTION_PROGRESS_STATUSES = [11, 10, 26, 27, 28, 7, 24, 16, 4, 19, 21, 22];
const PRODUCTION_DONE_STATUSES = [10, 26, 27, 28, 7, 24, 16, 4, 19, 21, 22];
const CLOSED_PROJECT_STATUSES = [5, 9];
const ANALYSIS_DONE_OR_CLOSE_STATUS_SET = new Set(["taskdone", "close"]);
const ANALYSIS_BLOCKING_STATUS_SET = new Set(["taskonprogress", "taskdone"]);
const DEVELOPMENT_DONE_TO_CLOSE_STATUS_SET = new Set([
  "developmentdone",
  "qaonprogress",
  "qadone",
  "qadonereadytorelease",
  "sitonprogress",
  "sitdone",
  "uatonprogress",
  "uatdone",
  "production",
  "close",
]);
const QA_IN_PROGRESS_TO_CLOSE_STATUS_SET = new Set([
  "qaonprogress",
  "qadone",
  "qadonereadytorelease",
  "sitonprogress",
  "sitdone",
  "uatonprogress",
  "uatdone",
  "production",
  "close",
]);
const QA_DONE_TO_CLOSE_STATUS_SET = new Set([
  "qadone",
  "qadonereadytorelease",
  "sitonprogress",
  "sitdone",
  "uatonprogress",
  "uatdone",
  "production",
  "close",
]);
const SIT_DONE_TO_CLOSE_STATUS_SET = new Set([
  "sitdone",
  "uatonprogress",
  "uatdone",
  "production",
  "close",
]);
const UAT_DONE_TO_CLOSE_STATUS_SET = new Set(["uatdone", "production", "close"]);
const PRODUCTION_DONE_TO_CLOSE_STATUS_SET = new Set(["production", "close"]);
const PRE_SIT_STATUS_SET = new Set([
  "new",
  "kick off",
  "kickoff",
  "design",
  "analysis",
  "analisa",
  "development",
  "qa",
]);
const S3_STATUS_SET = new Set(["development", "design", "qa"]);

const ANALYSIS_EXCLUDED_PATTERNS = [
  "Support%",
  "Support VIT%",
  "Payment%",
  "%Meeting",
  "%Sign Off",
  "Sign Off%",
  "%Sign Off",
  "BAST%",
  "%BAST%",
  "%BAST",
  "%Support",
  "Support SIT/UAT%",
  "Release Note",
  "User Manual%",
  "%User Manual",
  "%User Manual%",
  "Installation Manual",
  "Setup Development Environment",
  "Metronome",
  "Input Metronome",
  "Manual Book",
  "Internal Testing",
  "Project Plan",
  "Kickoff",
  "Support internal Testing and Bugs Fixing",
  "%Kick Off%",
  "%Project Plan%",
  "%Manual Book%",
  "Manual Book%",
  "Create Manual%",
  "Create Test Script%",
  "%Support Phase%",
  "%Script Phase%",
];
const INTERNAL_TESTING_STATUS_ID = 7;

function normalizeFieldName(value: any): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function fieldValue(
  customFields: ProjectCustomFieldLike[],
  candidates: string[]
): string | null {
  const valueByFieldName = new Map<string, string>();

  customFields.forEach((field) => {
    const normalizedName = normalizeFieldName(field.fieldName);
    if (!normalizedName || valueByFieldName.has(normalizedName)) return;

    valueByFieldName.set(normalizedName, String(field.fieldValue || "").trim());
  });

  for (const candidate of candidates) {
    const value = valueByFieldName.get(normalizeFieldName(candidate));
    if (value) return value;
  }

  return null;
}

function parseDateOnly(value: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  if (isNaN(date.getTime())) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getInternalTestingDueDate(
  customFields: ProjectCustomFieldLike[]
): Date | null {
  return parseDateOnly(
    fieldValue(customFields, ["Internal Testing Due Date", "Internal Testing Finish Date"])
  );
}

export function getPreferredProductionDate(
  customFields: ProjectCustomFieldLike[]
): Date | null {
  return parseDateOnly(
    fieldValue(customFields, ["Production Date", "Initial Production Date"])
  );
}

export function getEffectiveTaskDueDate(
  task: ProjectTaskLike,
  customFields: ProjectCustomFieldLike[]
): Date | null {
  if (Number(task.statusId || 0) === INTERNAL_TESTING_STATUS_ID) {
    const internalTestingDueDate = getInternalTestingDueDate(customFields);
    if (internalTestingDueDate) return internalTestingDueDate;
  }

  return parseDateOnly(task.dueDate ? String(task.dueDate) : null);
}

export function countViolatedCards(
  tasks: ProjectTaskLike[],
  customFields: ProjectCustomFieldLike[],
  today = new Date()
) {
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return tasks.filter((task) => {
    if (EXCLUDED_TASK_STATUS_ID_SET.has(Number(task.statusId || 0))) return false;
    const dueDate = getEffectiveTaskDueDate(task, customFields);
    if (!(dueDate instanceof Date)) return false;
    if (!isOverdueCandidateTask(task)) return false;
    if (matchesExcludedAnalysisSubject(task.subject)) return false;
    return dueDate.getTime() <= todayDate.getTime();
  }).length;
}

function parseProgress(done: number, total: number): number {
  if (total <= 0) return 100;
  return Number(Math.min(100, (((done / total) * 100) || 0)).toFixed(2));
}

function parseInverseProgress(total: number, done: number): number {
  if (done <= 0) return 0;
  return Number(Math.min(100, (((total / done) * 100) || 0)).toFixed(2));
}

function parseRemainingProgress(baseCount: number, subtractCount: number): number {
  if (baseCount <= 0) return 100;
  const remaining = Math.max(0, baseCount - subtractCount);
  return Number(Math.min(100, ((remaining / baseCount) * 100) || 0).toFixed(2));
}

function countTasksByStatuses(tasks: ProjectTaskLike[], statuses: number[]): number {
  return tasks.filter((task) => statuses.includes(Number(task.statusId))).length;
}

function wildcardToRegex(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  const regex = escaped.replace(/%/g, ".*");
  return new RegExp(`^${regex}$`, "i");
}

const ANALYSIS_EXCLUDED_REGEX = ANALYSIS_EXCLUDED_PATTERNS.map(wildcardToRegex);

export function matchesExcludedAnalysisSubject(subject?: string | null): boolean {
  const normalized = String(subject || "").trim();
  if (!normalized) return false;
  return ANALYSIS_EXCLUDED_REGEX.some((regex) => regex.test(normalized));
}

export function isOverdueCandidateTask(task?: Pick<ProjectTaskLike, "statusId"> | null) {
  return OVERDUE_TASK_STATUS_ID_SET.has(Number(task?.statusId || 0));
}

function diffInDays(from: Date, to: Date): number {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  const diffMs = end.getTime() - start.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function normalizeStatus(value?: string | null): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function normalizeCompactStatus(value?: string | null): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function countTasksByCompactStatusSet(tasks: ProjectTaskLike[], values: Set<string>): number {
  return tasks.filter((task) => values.has(normalizeCompactStatus(task.statusName))).length;
}

function percentageFromCount(done: number, total: number): number {
  if (total <= 0) return 0;
  return Number(((done / total) * 100).toFixed(2));
}

function formatKnownStatus(value?: string | null): string {
  switch (normalizeStatus(value)) {
    case "development":
      return "Development";
    case "qa":
      return "QA";
    case "sit":
      return "SIT";
    case "uat":
      return "UAT";
    case "production":
      return "Production";
    case "warranty":
      return "Warranty";
    case "support":
      return "Support";
    case "new":
      return "New";
    case "design":
      return "Design";
    case "kick off":
    case "kickoff":
      return "Kick Off";
    case "analisa":
      return "Analisa";
    case "analysis":
      return "Analysis";
    default:
      return String(value || "").trim();
  }
}

export function computeRedmineProjectProgress(
  input: RedmineProjectProgressInput
): RedmineProjectProgressResult {
  const today = input.today
    ? new Date(input.today.getFullYear(), input.today.getMonth(), input.today.getDate())
    : new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

  const startDate = parseDateOnly(
    fieldValue(input.customFields, ["Start Date", "Start date"])
  );
  const warrantyDate = parseDateOnly(
    fieldValue(input.customFields, [
      "Warranty/Maintenance End Date",
      "Warranty End Date",
      "Warranty Date",
    ])
  );
  const sitStartDate = parseDateOnly(
    fieldValue(input.customFields, ["SIT Start Date"])
  );
  const sitFinishDate = parseDateOnly(
    fieldValue(input.customFields, ["SIT Finish Date"])
  );
  const uatFinishDate = parseDateOnly(
    fieldValue(input.customFields, ["UAT Finish Date"])
  );
  const preferredProductionDate = getPreferredProductionDate(input.customFields);

  const includedTasks = input.tasks.filter(
    (task) => !EXCLUDED_TASK_STATUS_ID_SET.has(Number(task.statusId || 0))
  );

  const analysisTasks = includedTasks.filter(
    (task) =>
      Number(task.trackerId) === ANALYSIS_TRACKER_ID &&
      !matchesExcludedAnalysisSubject(task.subject)
  );
  const deliveryTasks = includedTasks.filter(
    (task) => Number(task.trackerId) === DELIVERY_TRACKER_ID
  );

  const analysisTotal = analysisTasks.length;
  const analysisDone = countTasksByCompactStatusSet(
    analysisTasks,
    ANALYSIS_DONE_OR_CLOSE_STATUS_SET
  );
  const analysisBlockingCount = countTasksByCompactStatusSet(
    analysisTasks,
    ANALYSIS_BLOCKING_STATUS_SET
  );

  const developmentTotal = deliveryTasks.length;
  const developmentDone = countTasksByCompactStatusSet(
    deliveryTasks,
    DEVELOPMENT_DONE_TO_CLOSE_STATUS_SET
  );

  const qaTotal = deliveryTasks.length;
  const qaInProgress = countTasksByCompactStatusSet(
    deliveryTasks,
    QA_IN_PROGRESS_TO_CLOSE_STATUS_SET
  );
  const qaDone = countTasksByCompactStatusSet(
    deliveryTasks,
    QA_DONE_TO_CLOSE_STATUS_SET
  );
  const qaSeverityDone = countTasksByStatuses(deliveryTasks, [QA_SEVERITY_DONE_STATUS_ID]);

  const sitTotal = deliveryTasks.length;
  const sitDone = countTasksByCompactStatusSet(deliveryTasks, SIT_DONE_TO_CLOSE_STATUS_SET);

  const uatTotal = deliveryTasks.length;
  const uatDone = countTasksByCompactStatusSet(deliveryTasks, UAT_DONE_TO_CLOSE_STATUS_SET);

  const productionTotal = deliveryTasks.length;
  const productionDone = countTasksByCompactStatusSet(
    deliveryTasks,
    PRODUCTION_DONE_TO_CLOSE_STATUS_SET
  );

  const analystDesignProgress = percentageFromCount(analysisDone, analysisTotal);
  const developmentProgress = percentageFromCount(developmentDone, developmentTotal);
  const qaProgress = percentageFromCount(qaDone, qaTotal);
  const sitProgress = percentageFromCount(sitDone, sitTotal);
  const uatProgress = percentageFromCount(uatDone, uatTotal);
  const productionProgress = percentageFromCount(productionDone, productionTotal);

  const hasAnalysisTasks = analysisTasks.length > 0;
  const hasProductionWorkStarted = productionProgress > 0;
  const shouldBeNew = !startDate || startDate > today;

  let currentStatus = "";

  if (shouldBeNew) {
    currentStatus = "New";
  } else if (
    hasAnalysisTasks &&
    analystDesignProgress > 0 &&
    analystDesignProgress < 100 &&
    analysisBlockingCount > 0
  ) {
    currentStatus = "Analysis";
  } else if (sitProgress > 0 && sitProgress < 100 && qaProgress >= 100) {
    currentStatus = "SIT";
  } else if (uatProgress > 0 && uatProgress < 100 && sitProgress >= 100) {
    currentStatus = "UAT";
  } else if (hasProductionWorkStarted && uatProgress >= 100) {
    currentStatus = "Production";
  } else if (sitProgress >= 100 && uatProgress <= 0) {
    currentStatus = "SIT";
  } else if (uatProgress >= 100 && productionProgress <= 0) {
    currentStatus = "UAT";
  } else if (qaInProgress > 0 && developmentProgress >= 100) {
    currentStatus = "QA";
  } else if (developmentProgress > 0) {
    currentStatus = "Development";
  } else if (hasAnalysisTasks || analystDesignProgress > 0) {
    currentStatus = "Analysis";
  } else if (warrantyDate && today <= warrantyDate && productionProgress >= 100) {
    currentStatus = "Warranty";
  } else if (warrantyDate && today > warrantyDate && Number(input.projectStatus) === 5) {
    currentStatus = "Support";
  } else {
    currentStatus = formatKnownStatus(input.previousCurrentStatus) || "New";
  }

  const activeSeverityFiveTasks = includedTasks.filter((task) =>
    isOverdueCandidateTask(task) &&
    !matchesExcludedAnalysisSubject(task.subject)
  );
  const dueDates = activeSeverityFiveTasks
    .map((task) => getEffectiveTaskDueDate(task, input.customFields))
    .filter((value): value is Date => value instanceof Date);
  const nearestDueDate =
    dueDates.length > 0
      ? dueDates
          .filter((date) => date <= today)
          .sort((a, b) => a.getTime() - b.getTime())[0] || null
      : null;
  const hasSeverityFiveActiveTask = activeSeverityFiveTasks.length > 0;

  let severity = 0;

  if (CLOSED_PROJECT_STATUSES.includes(Number(input.projectStatus))) {
    severity = 0;
  } else if (
    ["production", "warranty", "support"].includes(normalizeStatus(currentStatus)) &&
    productionProgress > 0
  ) {
    severity = 0;
    // Severity checks below must stay ordered from S5 down to S1.
  } else if (nearestDueDate && nearestDueDate <= today && hasSeverityFiveActiveTask) {
    severity = 5;
  } else if (
    sitStartDate &&
    sitStartDate <= today &&
    PRE_SIT_STATUS_SET.has(normalizeStatus(currentStatus))
  ) {
    severity = 4;
  } else if (
    sitFinishDate &&
    sitStartDate &&
    S3_STATUS_SET.has(normalizeStatus(currentStatus)) &&
    qaProgress < 100 &&
    qaSeverityDone < qaTotal &&
    sitProgress < 100 &&
    diffInDays(today, sitStartDate) <= 5
  ) {
    severity = 3;
  } else if (
    uatFinishDate &&
    uatProgress < 100 &&
    ["sit", "uat"].includes(normalizeStatus(currentStatus)) &&
    uatFinishDate <= today
  ) {
    severity = 2;
  } else if (
    preferredProductionDate &&
    preferredProductionDate < today &&
    uatProgress < 100
  ) {
    severity = 1;
  }

  return {
    currentStatus,
    analystDesignProgress,
    developmentProgress,
    qaProgress,
    sitProgress,
    uatProgress,
    productionProgress,
    severity,
  };
}
