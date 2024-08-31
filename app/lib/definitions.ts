export type JoinQuestionnaireQuestion = {
    id: number;
    created_at: Date;
    question_id: number;
    questionnaire_id: number;
    priority: number;
};

export type JoinUserQuestionnaire = {
    id: number;
    created_at: Date;
    user_id: number;
    questionnaire_id: number;
    status: "IN_PROGRESS" | "COMPLETE";
};

export type Question = {
    id: number;
    created_at: Date;
    type: string;
    prompt: string;
    options: string[] | null;
};

export type Questionnaire = {
    id: number;
    created_at: Date;
    name: string;
};

export type User = {
    id: number;
    created_at: Date;
    username: string;
    password: string;
    is_admin: boolean;
};

export type UserResponse = {
    id: number;
    created_at: Date;
    user_id: number;
    question_id: number;
    responses: string[];
};
