"use client";

import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Question } from "../lib/definitions";
import Button from "../ui/button";
import { redirect } from "next/navigation";

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
  const defaultValues: { [key: string]: string | string[] } = {};
  const values: { [key: string]: string | string[] } = {};
  questions.forEach(question => {
    if (question.id) {
      if (question.type === "mcq") {
        defaultValues[`question-${question.id}`] = "";
        values[`question-${question.id}`] = question.responses;
      } else {
        defaultValues[`question-${question.id}`] = [];
        values[`question-${question.id}`] = question.responses[0];
      }
    };
  });

  const { control, handleSubmit, formState: { errors } } = useForm({ defaultValues, values });
  const [redirectPath, setRedirectPath] = useState("");

  const validateCheckbox = (value: string | string[]) => {
    return value && value.length > 0 ? true : "At least one option must be selected";
  };

  const validateTextarea = (value: string | string[]) => {
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

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server Error:", errorData.message);
        return;
      }

      if (response.status === 403) {
        setRedirectPath("/");
      } else {
        setRedirectPath("/questionnaires");
      };
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  useEffect(() => {
    if (redirectPath !== "") {
      redirect(redirectPath);
    }
  }, [redirectPath]);

  const questionCards = questions.map((q, i) => (
    <div key={i}>
      <div>
        <span>{q.prompt}</span>
      </div>
      <div>
        {q.type === "mcq" && q.options ? (
          q.prompt.includes("Select all that apply") ? (
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
                              field.onChange(typeof(selectedOptions) !== "string" && selectedOptions.filter((v: string) => v !== option));
                            }
                          }}
                        />
                        <label htmlFor={`question-${q.id}-option-${index}`}>{option}</label>
                      </div>
                    ))}
                    <span>{errors?.[`question-${q.id}`]?.message?.toString()}</span>
                  </>
                )}
              />
            </div>
          ) : (
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
                        <label htmlFor={`question-${q.id}-option-${index}`}>{option}</label>
                      </div>
                    ))}
                    <span>{errors?.[`question-${q.id}`]?.message?.toString()}</span>
                  </>
                )}
              />
            </div>
          )
        ) : (
          <div>
            <Controller
              name={`question-${q.id}`}
              control={control}
              rules={{ validate: validateTextarea }}
              render={({ field }) => (
                <>
                  <textarea
                    {...field}
                    // defaultValue={q.responses[0]}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                  <span>{errors?.[`question-${q.id}`]?.message?.toString()}</span>
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
      <input type="hidden" name="questionnaireId" value={questionnaireId} />
      {questionCards}
      <Button type="submit">Submit</Button>
    </form>
  );
};

export default ResponseForm;
