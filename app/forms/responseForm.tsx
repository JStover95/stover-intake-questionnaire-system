"use client";

import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Question } from "../lib/definitions";
import Button from "../ui/button";

interface IQuestionsWithResponses extends Question {
  responses: string[];
}

interface IResponseFormProps {
  questionnaireId: number;
  questions: IQuestionsWithResponses[];
}

interface IFormData {
  [key: string]: string | string[];
}


const ResponseForm = ({ questionnaireId, questions }: IResponseFormProps) => {
  const defaultValues: { [key: string]: string | string[] } = {
    "questionnaireId": ""
  };

  // Set prefilled values for each question
  const values: { [key: string]: string | string[] } = {
    "questionnaireId": questionnaireId.toString()
  };
  questions.forEach(question => {
    if (question.id) {

      // If the question is multiple choice, use a list of prefilled values
      if (question.type === "mcq") {
        defaultValues[`question-${question.id}`] = "";
        values[`question-${question.id}`] = question.responses;

      // If the question is a text response, use a string
      } else {
        defaultValues[`question-${question.id}`] = [];
        values[`question-${question.id}`] = question.responses[0];
      }
    };
  });

  const { control, handleSubmit, formState: { errors } } = useForm(
    { defaultValues, values }
  );
  const [redirectPath, setRedirectPath] = useState("");

  const validateCheckbox = (value: string | string[]) => {
    // Enforce that multiple choice questions have at least one answer selected
    return value && value.length > 0 ? true : "At least one option must be selected";
  };

  const validateTextarea = (value: string | string[]) => {
    // Enforce that text response questions are not blank
    if (value) {
      if (typeof(value) === "string") {
        return value.trim() !== "" ? true : "This field cannot be left blank";
      } else {
        return value[0].trim() !== "" ? true : "This field cannot be left blank";
      }
    }
    return "This field cannot be left blank";
  };

  const onSubmit = async (data: IFormData) => {
    try {
      const response = await fetch("/api/response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      // If there was a server error
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server Error:", errorData.message);
        return;
      }

      // If the user is not authenticated
      if (response.status === 403) {

        // Redirect to the login page
        setRedirectPath("/");
      } else {

        // Else redirect to the questionnaires page
        setRedirectPath("/questionnaires");
      };
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  // After form submission is complete, use window.location.href to force a reload on redirect
  useEffect(() => {
    if (redirectPath !== "") {
      window.location.href = redirectPath;
    }
  }, [redirectPath]);

  // Create a list of questions
  const questionCards = questions.map((q, i) => (
    <div key={i} className="mb2">

      {/* The question prompt */}
      <div className="mb0-5">
        <span>{q.prompt}</span>
      </div>
      <div>
        {q.type === "mcq" && q.options ? (
          q.prompt.includes("Select all that apply") ? (

            // If the question is a "Select all that apply" question
            <div>
              <Controller
                name={`question-${q.id}`}
                control={control}
                rules={{ validate: validateCheckbox }}
                render={({ field }) => (
                  <>
                    {q.options && q.options.map((option, index) => (
                      <div key={index}>
                        <input
                          type="checkbox"
                          id={`question-${q.id}-option-${index}`}
                          value={option}
                          defaultChecked={q.responses.includes(option)}
                          onChange={(e) => {
                            const selectedOptions = field.value || [];
                            if (e.target.checked) {
                              field.onChange([...selectedOptions, option]);
                            } else {
                              field.onChange(
                                typeof(selectedOptions) !== "string"
                                && selectedOptions.filter(
                                  (v: string) => v !== option
                                )
                              );
                            }
                          }}
                        />
                        <label htmlFor={`question-${q.id}-option-${index}`}>
                          {option}
                        </label>
                      </div>
                    ))}
                    <span className="font-s font-red">
                      {errors?.[`question-${q.id}`]?.message?.toString()}
                    </span>
                  </>
                )}
              />
            </div>
          ) : (

            // If the question is a multiple choice single-answer question
            <div>
              <Controller
                name={`question-${q.id}`}
                control={control}
                rules={{ required: "Please select an option" }}
                render={({ field }) => (
                  <>
                    {q.options && q.options.map((option, index) => (
                      <div key={index}>
                        <input
                          type="radio"
                          id={`question-${q.id}-option-${index}`}
                          value={option}
                          defaultChecked={q.responses.includes(option)}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                        <label htmlFor={`question-${q.id}-option-${index}`}>
                          {option}
                        </label>
                      </div>
                    ))}
                    <span className="font-s font-red">
                      {errors?.[`question-${q.id}`]?.message?.toString()}
                    </span>
                  </>
                )}
              />
            </div>
          )
        ) : (

          // If the question is a text response question
          <div>
            <Controller
              name={`question-${q.id}`}
              control={control}
              rules={{ validate: validateTextarea }}
              render={({ field }) => (
                <>
                  <textarea
                    className="w100p h100"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                  <span className="font-red font-s">
                    {errors?.[`question-${q.id}`]?.message?.toString()}
                  </span>
                </>
              )}
            />
          </div>
        )}
      </div>
    </div>
  ))

  return (
    <form onSubmit={handleSubmit(onSubmit)}>

      {/* A hidden field for sending the questionnaire id with the request */}
      <Controller
        name={"questionnaireId"}
        control={control}
        render={() => <input type="hidden" name="questionnaireId" />}
      />
      {questionCards}
      <Button type="submit" className="btn btn-large btn-primary">Submit</Button>
    </form>
  );
};

export default ResponseForm;
