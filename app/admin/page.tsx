import { and, eq } from "drizzle-orm";
import { db } from "../lib/db";
import { joinQuestionnaireQuestion, joinUserQuestionnaire, question, questionnaire, user, userResponse } from "../lib/schema";
import Button from "../ui/button";
import { TableRow } from "../lib/definitions";
import ModalButton from "../ui/modalButton";


export default async function AdminDashboard() {
  const data = await db.select()
    .from(userResponse)
    .leftJoin(
      user,
      eq(user.id, userResponse.userId)
    )
    .leftJoin(
      question,
      eq(question.id, userResponse.questionId)
    ).leftJoin(
      joinQuestionnaireQuestion,
      eq(joinQuestionnaireQuestion.questionId, question.id)
    ).leftJoin(
      questionnaire,
      eq(questionnaire.id, joinQuestionnaireQuestion.questionnaireId)
    )
    .rightJoin(
      joinUserQuestionnaire,
      and(
        eq(joinUserQuestionnaire.userId, user.id),
        eq(joinUserQuestionnaire.questionnaireId, questionnaire.id)
      )
    )

  function groupDataByUserAndQuestionnaire(data: any[]): TableRow[] {
    // Create a map to store data grouped by userId and questionnaireId
    const groupedData: { [key: string]: TableRow } = {};

    data.forEach(entry => {
      const { userId } = entry.UserResponse;
      const { id: questionnaireId, name: questionnaireName } = entry.Questionnaire;
      const { id: questionId, prompt, type } = entry.Question;
      const { status } = entry.JoinUserQuestionnaire;
      const responses = entry.UserResponse.responses;

      // Create a unique key for each user and questionnaire combination
      const key = `${userId}-${questionnaireId}`;

      // Initialize the structure if not present
      if (!groupedData[key]) {
        groupedData[key] = {
          userId,
          username: entry.User.username,
          questionnaireId,
          questionnaireName,
          questionnaireStatus: status,
          responses: []
        };
      }

      // Add the current question and response to the grouped structure
      groupedData[key].responses.push({
        questionId,
        prompt,
        type,
        responses
      });
    });

    // Convert the map back to an array for display
    return Object.values(groupedData);
  }

  // Get all table rows
  const tableRows = groupDataByUserAndQuestionnaire(data);

  return (
    <main className="column align-center">
      <div className="column">

        {/* Header */}
        <div className="flex align-center justify-space-between mb2">
          <h1>Admin Dashboard</h1>
          <div>
            <Button navUrl="/api/logout" className="btn btn-large btn-primary">
              Logout
            </Button>
          </div>
        </div>

        {/* Data table */}
        <div>
          <table>
            <thead>
              <tr className="border-b-dark">
                <th className="p1">User</th>
                <th className="p1">Questionnaire</th>
                <th className="p1">Status</th>
                <th className="p1">No. Responses</th>
                <th className="p1"></th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, i) => {
                return (
                  <tr key={`row-${i}`} className="border-b-light">
                    <td className="p1">{row.username}</td>
                    <td className="p1">{row.questionnaireName}</td>
                    <td className="p1">{
                      row.questionnaireStatus === "COMPLETE"
                      ? "Complete"
                      : "In progress"
                    }</td>
                    <td className="p1">{row.responses.length}</td>
                    <td className="p1">
                      <ModalButton
                        className="btn btn-large btn-primary" tableRow={row}
                      >
                        View
                      </ModalButton>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
};


export const dynamic = "force-dynamic";
