export type VercelRequest = {
  method?: string;
  query: Record<string, string | string[] | undefined>;
  body?: any;
};

export type VercelResponse = {
  status(_code: number): VercelResponse;
  json(_body: unknown): void;
  send(_body: unknown): void;
};
