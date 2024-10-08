"use client";

import React, { useState } from "react";
import { TableRow } from "../lib/definitions";
import Button from "./button";

interface IModalButtonProps {
  className?: string;
  children: React.ReactNode;
  tableRow: TableRow;
}


const ModalButton = ({ className, children, tableRow }: IModalButtonProps) => {
  /* A modal button specifically for use on the admin dashboard that displays data for a single table row. */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<TableRow | null>(null);

  const openModal = (row: TableRow) => {
    setSelectedRow(row);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRow(null);
  };

  return (
    <React.Fragment>
      <Button className={className} onClick={() => openModal(tableRow)}>
        {children}
      </Button>
      {isModalOpen && selectedRow && (
        <React.Fragment>

          {/* The background to show behind the modal */}
          <div className="modal-bg"></div>

          {/* The modal's content */}
          <div className="modal border-radius p2">
            <p><strong>Username:</strong> {selectedRow.username}</p>
            <p><strong>Questionnaire Name:</strong> {
              selectedRow.questionnaireName}
            </p>
            <p><strong>Questionnaire Status:</strong> {
              selectedRow.questionnaireStatus == "COMPLETE"
              ? "Complete"
              : "In progress"
            }</p>
            <p><strong>No. of Responses:</strong> {
              selectedRow.responses.length
            }</p>
            <ul>
              {selectedRow.responses.map((response, index) => (
                <li key={index} className="mb0-5">
                  <strong>Q:</strong> {response.prompt}<br />
                  <strong>A:</strong> {response.responses.join(", ")}
                </li>
              ))}
            </ul>

            {/* The button for closing the modal */}
            <Button className="btn btn-large btn-primary" onClick={closeModal}>Close</Button>
          </div>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default ModalButton;
