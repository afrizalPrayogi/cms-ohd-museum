type RetryableFn<T> = () => Promise<T>;

type PrismaLikeError = {
  code?: string;
  message?: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isRetryablePrismaError(error: unknown): boolean {
  const e = error as PrismaLikeError | undefined;
  const code = String(e?.code || "").trim();
  return ["P1001", "P2024", "P2037"].includes(code);
}

export async function withPrismaRetry<T>(
  fn: RetryableFn<T>,
  options?: {
    retries?: number;
    delayMs?: number;
  }
): Promise<T> {
  const retries = options?.retries ?? 3;
  const delayMs = options?.delayMs ?? 1000;

  let lastError: unknown;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isRetryablePrismaError(error) || attempt === retries) {
        throw error;
      }
      await sleep(delayMs * attempt);
    }
  }

  throw lastError;
}
