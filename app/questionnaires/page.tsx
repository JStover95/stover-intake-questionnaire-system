import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import { joinUserQuestionnaire, questionnaire } from "../lib/schema";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Button from "../ui/button";

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
    .where(eq(joinUserQuestionnaire.userId, parseInt(userData.id)));

  const questionnaireCards: React.ReactNode[] = [];
  await Promise.all([questionnaires, joinQuestionnaires]).then(result => {
    const questionnaires = result[0];
    const joins = result[1];

    questionnaires.forEach((questionnaire, i) => {
      const join = joins.find(
        join => join.questionnaireId == questionnaire.id
      );

      questionnaireCards.push((
        <div key={i}>
          <div>
            <span>{questionnaire.name}</span>
          </div>
          <div>
          {join ? (
            <span>{join.status == "COMPLETE" ? "Complete" : "In progress"}</span>
          ) : <span>Not started</span>}
          </div>
          <div>
            <Button navUrl={"/questionnaires/response?id=" + questionnaire.id}>
              {join ? (join.status == "COMPLETE" ? "Edit" : "Continue") : "Begin"}
            </Button>
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
      <div>
        <Button navUrl="/api/logout">Logout</Button>
      </div>
    </main>
  );
};
