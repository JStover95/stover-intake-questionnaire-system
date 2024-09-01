import { db } from "@/app/lib/db";
import { Question, UserResponse } from "@/app/lib/definitions";
import { joinQuestionnaireQuestion, question, questionnaire, userResponse } from "@/app/lib/schema";
import CheckBox from "@/app/ui/checkbox";
import TextArea from "@/app/ui/textarea";
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

  if (!user && !user) {
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
  questions.forEach(q => {
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

  const userResponses: UserResponse[] = [];
  const questionCards = questionsWithResponses.map((q, i) => (
    <div key={i}>
      <div>
        <span>{q.prompt}</span>
      </div>
      <div>
        {q.type === "mcq" && q.options ? (
          <div>
            {q.options.map((option, index) => (
              <div key={index}>
                <CheckBox
                  id={`question-${i}-option-${index}`}
                  name={`question-${i}-options`}
                  value={option}
                  checked={q.responses?.includes(option) || false}
                  userId={userData.id}
                  responses={userResponses}
                  questionId={q.id || -1}
                />
              {/* <input
                type="checkbox"
                onChange={(e) => q.id && handleCheckboxChange(q.id, option, e.target.checked)}
              />
              <label htmlFor={`question-${i}-option-${index}`}>{option}</label> */}
              </div>
            ))}
          </div>
        ) : (
          <div>
            <TextArea
              name={`question-${i}`}
              value={q.responses?.[0] || ""}
              userId={userData.id}
              responses={userResponses}
              questionId={q.id || -1}
            />
            {/* <textarea
              value={q.responses?.[0] || ""}
              onChange={(e) => q.id && handleTextChange(q.id, e.target.value)} // Define this function to handle changes
              placeholder="Type your response here..."
            /> */}
          </div>
        )}
      </div>
    </div>
  ));

  return (
    <main>
      <div>
        <h1>{questions[0].Questionnaire?.name}</h1>
      </div>
      <div>
        {questionCards}
      </div>
    </main>
  )
};


export default RespondScreen;
