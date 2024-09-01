import ResponseForm from "@/app/forms/responseForm";
import { db } from "@/app/lib/db";
import { Question, UserResponse } from "@/app/lib/definitions";
import { joinQuestionnaireQuestion, question, questionnaire, userResponse } from "@/app/lib/schema";
import { and, eq, inArray } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface IRespondScreen {
  searchParams: { id: number }
}

interface IQuestionsWithResponses extends Question {
  responses: string[];
}


const RespondScreen = async ({ searchParams }: IRespondScreen) => {
  const cookieStore = cookies();
  const user = cookieStore.get("user")?.value;

  if (!user) {
    redirect("/");
  }

  const userData = JSON.parse(user);
  const { id } = searchParams;

  const questions = await db.select()
    .from(question)
    .fullJoin(
      joinQuestionnaireQuestion,
      eq(question.id, joinQuestionnaireQuestion.questionId)
    )
    .fullJoin(
      questionnaire,
      eq(joinQuestionnaireQuestion.questionnaireId, questionnaire.id)
    )
    .where(eq(questionnaire.id, id))

  const questionIds: number[] = [];
  const questionsWithResponses: IQuestionsWithResponses[] = [];
  questions.sort((a, b) => {
    if (a.JoinQuestionnaireQuestion && b.JoinQuestionnaireQuestion) {
      const aPriority = a.JoinQuestionnaireQuestion.priority;
      const bPriority = b.JoinQuestionnaireQuestion.priority;
      if (aPriority > bPriority) {
        return 1;
      } else if (bPriority > aPriority) {
        return -1;
      }
      return 0;
    }
    return 0;
  }).forEach(q => {
    if (q.Question) {
      questionIds.push(q.Question.id);
      questionsWithResponses.push({ ...q.Question, responses: [] as string[] })
    }
  });

  const responses = await db.select()
    .from(userResponse)
    .where(and(
      eq(userResponse.userId, userData.id),
      inArray(userResponse.questionId, questionIds)
    ))

  questionsWithResponses.forEach(q => {
    const response = responses.find(
      response => response.questionId == q.id
    )?.responses;
    if (response) {
      q.responses = response;
    }
  });

  return (
    <main>
      <div>
        <h1>{questions[0].Questionnaire?.name}</h1>
      </div>
      <div>
        <ResponseForm
          questionnaireId={id}
          questions={questionsWithResponses}
        />
      </div>
    </main>
  )
};


export default RespondScreen;
