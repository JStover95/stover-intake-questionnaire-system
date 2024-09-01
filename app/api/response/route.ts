import { db } from "@/app/lib/db";
import { UserResponse } from "@/app/lib/definitions";
import { joinQuestionnaireQuestion, joinUserQuestionnaire, questionnaire, userResponse } from "@/app/lib/schema";
import { and, eq, inArray } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface IFormData {
  [key: string]: string | string[];
}


function arraysEqual(a: any[], b: any[]) {
  /**
 * Compares two arrays for equality.
 *
 * This function checks if two arrays are equal by comparing their elements one by one. 
 * The comparison is strict (`===`), meaning that both the value and the type of elements must be the same.
 *
 * @param {any[]} a - The first array to compare.
 * @param {any[]} b - The second array to compare.
 * 
 * @returns {boolean} - Returns `true` if both arrays are equal, `false` otherwise.
 */
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }

  return true;
}


export async function POST(request: Request) {

  // Check for the user's session cookie
  const cookieStore = cookies();
  const user = cookieStore.get("user")?.value;

  // If a session cookie is not present, redirect to the login page
  if (!user) {
    return new NextResponse("Forbidden request.", { status: 403 });
  }

  const userData = JSON.parse(user);
  const formData: IFormData = await request.json();
  const questionnaireId = formData["questionnaireId"];
  const responses: UserResponse[] = [];
  const questionIds: number[] = [];

  // Iterate over all of the question responses
  for (let [key, value] of Object.entries(formData)) {

    // Skip the hidden field "quetionnaireId" and any empty responses
    if (key === "questionnaireId" || value === "") {
      continue;
    };

    // Get the id of the question being answered
    const idStr = key.match(/\d+/);

    // Get the question's responses
    let val: string[];
    if (typeof(value) === "string") {
      val = value.split(",");
    } else {
      val = value;
    };

    if (idStr) {
      const questionId = parseInt(idStr[0]);

      // Make a list of ids for every question in the questionnaire
      if (!questionIds.includes(questionId)) questionIds.push(questionId);

      // Make a list of all question responses
      responses.push({
        userId: parseInt(userData.id),
        questionId,
        responses: val,
      });
    }
  }

  // Get any of the users' previous responses to any of the current questions
  const prevResponses = await db.select()
    .from(userResponse)
    .where(and(
      inArray(userResponse.questionId, questionIds),
      eq(userResponse.userId, parseInt(userData.id)),
    ));

  // Make a list of promises to wait for all db queries to finish in parallel
  const promises: Promise<any>[] = [];

  // Get any join table between the user and this questionnaire
  const userJoin = db.select()
    .from(joinUserQuestionnaire)
    .where(and(
      eq(joinUserQuestionnaire.userId, parseInt(userData.id)),
      eq(joinUserQuestionnaire.questionnaireId, questionnaireId ? parseInt(questionnaireId.toString()) : -1)
    ));
  promises.push(userJoin);

  // If there are any previous responses
  if (prevResponses) {
    prevResponses.forEach(prevResponse => {
      const i = responses.findIndex(response => response.questionId == prevResponse.questionId);

      // If a the user made a new response to a question in this questionnaire
      if (i !== -1) {

        // Update the existing response with the new response
        const promise = db.update(userResponse)
          .set({ responses: responses[i].responses })
          .where(eq(userResponse.id, prevResponse.id));
        promises.push(promise);

        // Remove the updated response from the list of responses
        responses.splice(i, 1);
      };
    });
  }

  // Create a new response for any remaining responses
  if (responses.length) {
    promises.push(db.insert(userResponse).values(responses));
  };

  await Promise.all(promises).then(async (results) => {
    if (questionnaireId) {
      const id = parseInt(questionnaireId.toString());

      // Get the current questionnaire and all of its questions
      const questionnaireResult = await db.select()
        .from(questionnaire)
        .fullJoin(
          joinQuestionnaireQuestion,
          eq(questionnaire.id, joinQuestionnaireQuestion.questionnaireId)
        ).where(eq(questionnaire.id, id));

      // Make a list of all question ids for the questionnaire
      const allQuestionIds = questionnaireResult.map(
        result => result.JoinQuestionnaireQuestion?.questionId
      );

      // Check whether the user answered all questions in the questionnaire
      const questionnaireComplete = arraysEqual(allQuestionIds.sort(), questionIds.sort());

      // Create or update a join between the user and the questionnaire with a status
      if (questionnaireComplete && results[0].length) {
        await db.update(joinUserQuestionnaire)
          .set({ status: "COMPLETE" })
          .where(eq(joinUserQuestionnaire.id, results[0][0].id))
      } else if (!results[0].length) {
        await db.insert(joinUserQuestionnaire).values({
          userId: parseInt(userData.id),
          questionnaireId: id,
          status: questionnaireComplete ? "COMPLETE" : "IN_PROGRESS", 
        })
      };
    };
  });

  return new NextResponse("Form submitted successfully", { status: 200 });
};