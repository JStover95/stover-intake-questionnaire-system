import { db } from "@/app/lib/db";
import { UserResponse } from "@/app/lib/definitions";
import { userResponse } from "@/app/lib/schema";
import { eq, inArray } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Response) {
  const cookieStore = cookies();
  const user = cookieStore.get("user")?.value;

  if (!user) {
    const url = new URL("/", request.url)
    return NextResponse.redirect(url);
  }

  const userData = JSON.parse(user);
  const formData = await request.formData();
  const responses: UserResponse[] = [];
  const questionIds: number[] = [];

  for (let [key, value] of formData.entries()) {
    const idStr = key.match(/\d+/);
    if (idStr) {
      const questionId = parseInt(idStr[0]);
      questionIds.push(questionId);
      const response = responses.find(response => response.questionId == questionId);
      if (response) {
        response.responses.push(value.toString());
      } else {
        responses.push({
          userId: userData.id,
          questionId,
          responses: [value.toString()],
        });
      }
    }
  }

  const prevResponses = await db.select()
    .from(userResponse)
    .where(inArray(userResponse.questionId, questionIds));

  const promises: Promise<any>[] = [];

  if (prevResponses) {
    prevResponses.forEach(prevResponse => {
      const i = responses.findIndex(response => response.questionId == prevResponse.questionId);
      if (i) {
        const promise = db.update(userResponse)
          .set({ responses: responses[i].responses })
          .where(eq(userResponse.id, prevResponse.id));
        promises.push(promise);
        responses.splice(i, 1);
      };
    });
  }

  promises.push(db.insert(userResponse).values(responses));
  Promise.all(promises).then(results => results.forEach(result => console.log(result)));

  const url = new URL("/questionnaires", request.url)
  const res = NextResponse.redirect(url);
  return res;
};