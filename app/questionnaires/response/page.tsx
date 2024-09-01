import ResponseForm from "@/app/forms/responseForm";
import { db } from "@/app/lib/db";
import { Question } from "@/app/lib/definitions";
import {
  joinQuestionnaireQuestion,
  question,
  questionnaire,
  userResponse
} from "@/app/lib/schema";
import { and, eq, inArray } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface IRespondScreenProps {
  searchParams: { id: number }
}

interface IQuestionsWithResponses extends Question {
  responses: string[];
}


const RespondScreen = async ({ searchParams }: IRespondScreenProps) => {

  // Check the user's session cookie
  const cookieStore = cookies();
  const user = cookieStore.get("user")?.value;

  // Redirect to the login page if the session cookie is not present
  if (!user) {
    redirect("/");
  }

  const userData = JSON.parse(user);

  // The id of the current questionnaire
  const { id } = searchParams;

  // Get all questions for this questionnaire
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

  // Make a list of question ids and a list of questions that include an empty list of responses
  const questionIds: number[] = [];
  const questionsWithResponses: IQuestionsWithResponses[] = [];
  questions.sort((a, b) => {  // Sort questions by priority
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

  // Get any past responses to questions in this questionnaire
  const responses = await db.select()
    .from(userResponse)
    .where(and(
      eq(userResponse.userId, userData.id),
      inArray(userResponse.questionId, questionIds)
    ))

  // Insert any past responses to questions in this questionnaire
  questionsWithResponses.forEach(q => {
    const response = responses.find(
      response => response.questionId == q.id
    )?.responses;
    if (response) {
      q.responses = response;
    }
  });

  return (
    <main className="align-center column">

      {/* The header */}
      <div>
        <h1>{questions[0].Questionnaire?.name}</h1>
      </div>

      {/* The response form */}
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
