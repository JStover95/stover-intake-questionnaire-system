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

  const tableRows = groupDataByUserAndQuestionnaire(data);

  return (
    <main>
      <div>
        <h1>Admin Dashboard</h1>
      </div>
      <div>
        <span>Data</span>
      </div>
      <div>
        <Button navUrl="/api/logout">Logout</Button>
      </div>
      <div>
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Questionnaire</th>
              <th>Status</th>
              <th>No. Responses</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, i) => {
              return (
                <tr key={`row-${i}`}>
                  <td>{row.username}</td>
                  <td>{row.questionnaireName}</td>
                  <td>{row.questionnaireStatus}</td>
                  <td>{row.responses.length}</td>
                  <td><ModalButton tableRow={row}>View</ModalButton></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  )
};
