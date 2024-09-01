import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Button from "../ui/button";
import { db } from "../lib/db";
import { joinUserQuestionnaire, questionnaire } from "../lib/schema";
import { eq } from "drizzle-orm";


export default async function Questionnaires() {

  // Check for the user's session cookie
  const cookieStore = cookies();
  const user = cookieStore.get("user")?.value;

  // If the user's session cookie is not present, redirect to the login page
  if (!user) {
    redirect("/");
  }

  const userData = JSON.parse(user);

  // Get all questionnaires
  const questionnaires = db.select().from(questionnaire);

  // Get all joins that include the user's completion status for each questionnaire
  const joinQuestionnaires = db.select()
    .from(joinUserQuestionnaire)
    .where(eq(joinUserQuestionnaire.userId, parseInt(userData.id)));

  // Make a list of questionnaire cards to display
  const questionnaireCards: React.ReactNode[] = [];
  await Promise.all([questionnaires, joinQuestionnaires]).then(result => {
    const questionnaires = result[0];
    const joins = result[1];

    // For every questionnaire
    questionnaires.forEach((questionnaire, i) => {

      // Get a join with the current user that contains the completion status of this questionnaire, if any
      const join = joins.find(
        join => join.questionnaireId == questionnaire.id
      );

      questionnaireCards.push((
        <div key={i} className="border-mid border-radius mh1 p2 w200">

          {/* The name of the questionnaire */}
          <div className="mb1">
            <span className="font-l">{questionnaire.name}</span>
          </div>

          {/* The status of the questionnaire */}
          <div className="mb1">
          {join ? (
            <span>{join.status == "COMPLETE" ? "Complete" : "In progress"}</span>
          ) : <span>Not started</span>}
          </div>

          {/* The button to start the questionnaire */}
          <div>
            <Button
              className="btn btn-primary btn-large"
              navUrl={"/questionnaires/response?id=" + questionnaire.id}
            >
              Begin
            </Button>
          </div>
        </div>
      ));
    });
  });

  return (
    <main className="align-center column">
      <div className="column">

        {/* The header */}
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

        {/* The list of questionnaires */}
        <div className="flex">
          {questionnaireCards}
        </div>
      </div>
    </main>
  );
};
