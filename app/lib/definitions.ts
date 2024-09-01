export type JoinQuestionnaireQuestion = {
    id?: number;
    createdAt?: Date;
    questionId: number;
    questionnaireId: number;
    priority: number;
};

export type JoinUserQuestionnaire = {
    id?: number;
    createdAt?: Date;
    userId: number;
    questionnaireId: number;
    status: "IN_PROGRESS" | "COMPLETE";
};

export type Question = {
    id?: number;
    createdAt?: Date;
    type: string;
    prompt: string;
    options: string[] | null;
};

export type Questionnaire = {
    id?: number;
    createdAt?: Date;
    name: string;
};

export type User = {
    id?: number;
    createdAt?: Date;
    username: string;
    password: string;
    isAdmin: boolean;
};

export type UserResponse = {
    id?: number;
    createdAt?: Date;
    userId: number;
    questionId: number;
    responses: string[];
};

export type TableRow = {
  userId: number;
  username: string;
  questionnaireId: number;
  questionnaireName: string;
  questionnaireStatus: string;
  responses: {
    questionId: number;
    prompt: string;
    type: string;
    responses: string[];
  }[]
}
