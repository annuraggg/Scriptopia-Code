interface TestCase {
  _id?: string;
  input: string[];
  output: string;
  difficulty: "easy" | "medium" | "hard";
  isSample: boolean;
}

interface CustomSDSL {
  language: string;
  stub: string;
}

interface Problem {
  _id?: string;
  title: string;
  description: object;
  author?: string;
  difficulty: "easy" | "medium" | "hard";
  solved: boolean;
  acceptanceRate: number;
  tags: string[];
  votes?: number;
  sdsl: string[];
  customSdsl: CustomSDSL[];
  testCases: TestCase[];
  isPrivate?: boolean;
  allowInAssessments?: boolean;
  totalSubmissions?: number;
  successfulSubmissions?: number;
}

export type { Problem, TestCase, CustomSDSL };
