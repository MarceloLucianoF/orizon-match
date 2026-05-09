export type Project = {
  id: string;
  userId: string;
  type: "inventor" | "ict";
  segment: string;
  innovationType?: "melhoria" | "inovacao";
  patent?: {
    hasPatent: boolean;
    status?: "pending" | "granted";
  };
  maturity: number;
  needs: {
    investment: boolean;
    research: boolean;
    industry: boolean;
  };
  location: {
    region: string;
  };
  createdAt: number;
};

export type Organization = {
  id: string;
  role: "company" | "investor" | "ict" | "provider";
  segments: string[];
  trlMin?: number;
  trlMax?: number;
  location: {
    region: string;
  };
  interests: {
    investment: boolean;
    research: boolean;
    industry: boolean;
  };
  createdAt: number;
};
