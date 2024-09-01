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
        <div key={i} className="border-mid border-radius mh1 p2 w200">
          <div className="mb1">
            <span className="font-l">{questionnaire.name}</span>
          </div>
          <div className="mb1">
          {join ? (
            <span>{join.status == "COMPLETE" ? "Complete" : "In progress"}</span>
          ) : <span>Not started</span>}
          </div>
          <div>
            <Button
              className="btn btn-primary btn-large"
              navUrl={"/questionnaires/response?id=" + questionnaire.id}
            >
              {join ? (join.status == "COMPLETE" ? "Edit" : "Continue") : "Begin"}
            </Button>
          </div>
        </div>
      ));
    });
  });

  return (
    <main className="align-center column">
      <div className="column">
        <div className="align-center flex justify-space-between mb2">
          <h1>Questionnaires</h1>
          <div>
            <Button
              className="btn btn-primary btn-large"
              navUrl="/api/logout"
            >
              Logout
            </Button>
          </div>
        </div>
        <div className="flex">
          {questionnaireCards}
        </div>
      </div>
    </main>
  );
};
