import { DEV_LEADERBOARD, DEV_PROBLEMS, DEV_USER } from "@/lib/dev-mode";

type Row = Record<string, unknown>;

const profiles: Row[] = DEV_LEADERBOARD.map((user) => ({
  ...user,
  bio:
    user.id === DEV_USER.id
      ? "Electrical engineering student turning interview prep into a daily side quest."
      : "Consistent coder climbing the local leaderboard.",
  leetcode_handle: user.username,
  github_handle: user.username,
  linkedin_url: "https://www.linkedin.com",
}));

const problems: Row[] = DEV_PROBLEMS.map((problem) => ({
  ...problem,
  user_id: DEV_USER.id,
}));

const followers: Row[] = [
  { follower_id: "dev-a", following_id: DEV_USER.id },
  { follower_id: "dev-b", following_id: DEV_USER.id },
  { follower_id: DEV_USER.id, following_id: "dev-a" },
];

const tables: Record<string, Row[]> = { profiles, problems, followers };

class DemoQuery implements PromiseLike<{ data: unknown; error: null; count: number | null }> {
  private rows: Row[];
  private singleRow = false;
  private countRequested = false;
  private headOnly = false;

  constructor(private table: string) {
    this.rows = [...(tables[table] ?? [])];
  }

  select(columns = "*", options?: { count?: string; head?: boolean }) {
    void columns;
    this.countRequested = Boolean(options?.count);
    this.headOnly = Boolean(options?.head);
    return this;
  }

  eq(column: string, value: unknown) {
    this.rows = this.rows.filter((row) => row[column] === value);
    return this;
  }

  neq(column: string, value: unknown) {
    this.rows = this.rows.filter((row) => row[column] !== value);
    return this;
  }

  not(column: string, _operator: string, value: unknown) {
    this.rows = this.rows.filter((row) => row[column] !== value);
    return this;
  }

  in(column: string, values: unknown[]) {
    this.rows = this.rows.filter((row) => values.includes(row[column]));
    return this;
  }

  ilike(column: string, pattern: string) {
    const needle = pattern.replaceAll("%", "").toLowerCase();
    this.rows = this.rows.filter((row) => String(row[column] ?? "").toLowerCase().includes(needle));
    return this;
  }

  contains(column: string, values: unknown[]) {
    this.rows = this.rows.filter((row) => {
      const current = Array.isArray(row[column]) ? row[column] : [];
      return values.every((value) => current.includes(value));
    });
    return this;
  }

  gte(column: string, value: unknown) {
    this.rows = this.rows.filter((row) => String(row[column] ?? "") >= String(value));
    return this;
  }

  lte(column: string, value: unknown) {
    this.rows = this.rows.filter((row) => String(row[column] ?? "") <= String(value));
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    const direction = options?.ascending === false ? -1 : 1;
    this.rows.sort((a, b) => String(a[column] ?? "").localeCompare(String(b[column] ?? "")) * direction);
    return this;
  }

  range(start: number, end: number) {
    this.rows = this.rows.slice(start, end + 1);
    return this;
  }

  limit(size: number) {
    this.rows = this.rows.slice(0, size);
    return this;
  }

  single() {
    this.singleRow = true;
    return this;
  }

  maybeSingle() {
    this.singleRow = true;
    return this;
  }

  insert(value: Row | Row[]) {
    const inserted = Array.isArray(value) ? value : [value];
    tables[this.table] ??= [];
    tables[this.table].push(...inserted);
    this.rows = inserted;
    return this;
  }

  update(value: Row) {
    this.rows = this.rows.map((row) => ({ ...row, ...value }));
    return this;
  }

  delete() {
    return this;
  }

  then<TResult1 = { data: unknown; error: null; count: number | null }, TResult2 = never>(
    onfulfilled?: ((value: { data: unknown; error: null; count: number | null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    const result = {
      data: this.headOnly ? null : this.singleRow ? this.rows[0] ?? null : this.rows,
      error: null,
      count: this.countRequested ? this.rows.length : null,
    };
    return Promise.resolve(result).then(onfulfilled, onrejected);
  }
}

const channel = {
  on() {
    return channel;
  },
  subscribe() {
    return channel;
  },
  unsubscribe: async () => ({ status: "ok" }),
};

export function createDevSupabaseClient() {
  return {
    auth: {
      getUser: async () => ({
        data: { user: { id: DEV_USER.id, email: DEV_USER.email } },
        error: null,
      }),
      getSession: async () => ({
        data: { session: { user: { id: DEV_USER.id, email: DEV_USER.email } } },
        error: null,
      }),
      signOut: async () => ({ error: null }),
      signInWithPassword: async () => ({ data: { user: DEV_USER, session: {} }, error: null }),
      signUp: async () => ({ data: { user: DEV_USER, session: {} }, error: null }),
      exchangeCodeForSession: async () => ({ data: { session: {} }, error: null }),
    },
    from: (table: string) => new DemoQuery(table),
    rpc: async () => ({ data: null, error: null }),
    channel: () => channel,
    removeChannel: async () => ({ status: "ok" }),
    storage: {
      from: () => ({
        upload: async () => ({ data: { path: "local/avatar.png" }, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: "" } }),
      }),
    },
  };
}
