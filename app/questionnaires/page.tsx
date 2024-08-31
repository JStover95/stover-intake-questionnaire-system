import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import { joinUserQuestionnaire, questionnaire } from "../lib/schema";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Questionnaire } from "../lib/definitions";

export default async function Questionnaires() {
  const cookieStore = cookies();
  const user = cookieStore.get("user")?.value;

  if (!user && !user) {
    redirect("/");
  }

  const userData = JSON.parse(user);
  const questionnaires = db.select().from(questionnaire);
  const joinQuestionnaires = db.select()
    .from(joinUserQuestionnaire)
    .where(eq(joinUserQuestionnaire.userId, userData.id));

  const questionnaireCards: React.ReactNode[] = [];
  await Promise.all([questionnaires, joinQuestionnaires]).then(result => {
    const questionnaires = result[0];
    const joins = result[1];

    questionnaires.forEach((questionnaire, i) => {
      const join = joins.find(
        join => join.questionnaireId === questionnaire.id
      );

      questionnaireCards.push((
        <div key={i}>
          <span>{questionnaire.name}</span>
          {join && <span>{join.status}</span>}
          <div>
            <button>
              {join ? (join.status == "COMPLETE" ? "Edit" : "Continue") : "Begin"}
            </button>
          </div>
        </div>
      ));
    });
  });

  return (
    <main>
      <h1>Questionnaires</h1>
      <div>
        {questionnaireCards}
      </div>
    </main>
  );
};
