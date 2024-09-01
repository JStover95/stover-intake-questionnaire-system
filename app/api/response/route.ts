import { db } from "@/app/lib/db";
import { UserResponse } from "@/app/lib/definitions";
import { joinQuestionnaireQuestion, joinUserQuestionnaire, questionnaire, userResponse } from "@/app/lib/schema";
import { and, eq, inArray } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function arraysEqual(a: any[], b: any[]) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }

  return true;
}


export async function POST(request: Response) {
  const cookieStore = cookies();
  const user = cookieStore.get("user")?.value;

  if (!user) {
    const url = new URL("/", request.url)
    return NextResponse.redirect(url);
  }

  const userData = JSON.parse(user);
  const formData = await request.formData();
  const questionnaireId = formData.get("questionnaireId");
  const responses: UserResponse[] = [];
  const questionIds: number[] = [];

  for (let [key, value] of formData.entries()) {
    if (key === "questionnaireId" || value === "") {
      continue;
    };

    const idStr = key.match(/\d+/);
    if (idStr) {
      const questionId = parseInt(idStr[0]);
      if (!questionIds.includes(questionId)) questionIds.push(questionId);
      const response = responses.find(response => response.questionId == questionId);
      if (response) {
        response.responses.push(value.toString());
      } else {
        responses.push({
          userId: parseInt(userData.id),
          questionId,
          responses: [value.toString()],
        });
      }
    }
  }

  const prevResponses = await db.select()
    .from(userResponse)
    .where(and(
      inArray(userResponse.questionId, questionIds),
      eq(userResponse.userId, parseInt(userData.id)),
    ));

  const promises: Promise<any>[] = [];
  const userJoin = db.select()
    .from(joinUserQuestionnaire)
    .where(and(
      eq(joinUserQuestionnaire.userId, parseInt(userData.id)),
      eq(joinUserQuestionnaire.questionnaireId, questionnaireId ? parseInt(questionnaireId.toString()) : -1)
    ));
  promises.push(userJoin);

  if (prevResponses) {
    prevResponses.forEach(prevResponse => {
      const i = responses.findIndex(response => response.questionId == prevResponse.questionId);
      if (i !== -1) {
        const promise = db.update(userResponse)
          .set({ responses: responses[i].responses })
          .where(eq(userResponse.id, prevResponse.id));
        promises.push(promise);
        responses.splice(i, 1);
      };
    });
  }

  if (responses.length) {
    promises.push(db.insert(userResponse).values(responses));
  };

  Promise.all(promises).then(async (results) => {
    if (questionnaireId) {
      const id = parseInt(questionnaireId.toString());
      const questionnaireResult = await db.select()
        .from(questionnaire)
        .fullJoin(
          joinQuestionnaireQuestion,
          eq(questionnaire.id, joinQuestionnaireQuestion.questionnaireId)
        ).where(eq(questionnaire.id, id));

      const allQuestionIds = questionnaireResult.map(result => result.JoinQuestionnaireQuestion?.questionId);
      const questionnaireComplete = arraysEqual(allQuestionIds.sort(), questionIds.sort());
      if (questionnaireComplete && results[0].length) {
        db.update(joinUserQuestionnaire)
          .set({ status: "COMPLETE" })
          .where(eq(joinUserQuestionnaire.id, results[0][0].id))
          .then(console.log);
      } else if (!results[0].length) {
        db.insert(joinUserQuestionnaire).values({
          userId: parseInt(userData.id),
          questionnaireId: id,
          status: questionnaireComplete ? "COMPLETE" : "IN_PROGRESS", 
        }).then(console.log);
      };
    };
  });

  const url = new URL("/questionnaires", request.url)
  const res = NextResponse.redirect(url);
  return res;
};