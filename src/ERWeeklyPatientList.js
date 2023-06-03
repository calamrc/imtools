import './ERWeeklyPatientList.css';
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import {
  PlusCircleIcon,
  IssueClosedIcon,
  XCircleIcon,
  DownloadIcon,
} from "@primer/octicons-react"
import * as XLSX from "xlsx";
import Container from "react-bootstrap/Container";
import Table from "react-bootstrap/Table";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

const NUMBER_OF_COLUMNS = 6;
const HEADERS = [
  "Date",
  "Name",
  "Age/Sex",
  "Chief Complaint",
  "Diagnosis",
  "Disposition"
]

export default function ERWeeklyPatientList() {
  const now = new Date();
  const offset = 270;

  const [patientList, setPatientList] = useState(() => {
    const cookie = Cookies.get("patientList");
    if(cookie === undefined) {
      return [];
    } else {
      return JSON.parse(cookie);
    }
  });

  const [patientInfo, setPatientInfo] = useState(now.toLocaleDateString());
  const [editState, setEditState] = useState(0);
  const [editPatientIndex, setEditPatientIndex] = useState(patientList.length-1);
  const [addPatientLabel, setAddPatientLabel] = useState("Add Patient to List");
  const [filename, setFilename] = useState("ERWeeklyPatientList-" + now.toJSON().slice(0, 10));
  const [confirmDelete, setConfirmDelete] = useState(false);
  /* const [deleteLabel, setDeleteLabel] = useState("Delete Table"); */
  const [tableHeight, setTableHeight] = useState((window.innerHeight-offset).toString() + "px");

  useEffect(() => {
    function handleResize() {
      setTableHeight((window.innerHeight-offset).toString() + "px");
    }
    window.addEventListener("resize", handleResize)
  });

  /* function handleDeleteTable() {
   *   if(confirmDelete) {
   *     Cookies.remove("patientList");
   *     setPatientList([]);
   *     setDeleteLabel("Delete Table")
   *     setConfirmDelete(false);
   *     setAddPatientLabel("Add Patient to List");
   *   } else {
   *     setDeleteLabel("Confirm Delete")
   *     setConfirmDelete(true);
   *   }
   * } */

  function handleInfoChange(value) {
    if(editState) {
      if(value.trim() === "") {
        setAddPatientLabel("Delete Patient Info");
      } else {
        setAddPatientLabel("Save Edits");
      } 
    } else {
      setAddPatientLabel("Add Patient to List");
    }

    setPatientInfo(value);
  }

  function handleEditButton(info, index) {
    if(editState === 0 || index !== editPatientIndex) {
      setEditState(1);
      setPatientInfo(info.trim());
      setEditPatientIndex(index);
      setAddPatientLabel("Save Edits");
    } else if(editState === 1) {
      setEditState(2);
      setPatientInfo("");
      setEditPatientIndex(index);
      setAddPatientLabel("Delete Patient Info");
    } else {
      setEditState(0);
      setAddPatientLabel("Add Patient to List");
    }
  }

  function handleAddPatient() {
    let patientInfoCopy = patientInfo;

    patientInfoCopy = patientInfoCopy.trim();

    let patientListCopy;
    const lines = patientInfoCopy.split("\n");

    for(let i = lines.length; i < NUMBER_OF_COLUMNS; i++) {
      patientInfoCopy += "\n";
    }

    if(editState === 0 && patientInfoCopy.trim() !== "") {
      patientListCopy = [...patientList, patientInfoCopy];
    } else if(editState === 1) {
      patientListCopy = [...patientList];
      patientListCopy.splice(editPatientIndex, 1, patientInfoCopy);
    } else if(editState === 2) {
      patientListCopy = [...patientList];
      patientListCopy.splice(editPatientIndex, 1);
    } else{
      patientListCopy = [...patientList];
    }

    Cookies.set("patientList", JSON.stringify(patientListCopy), {
      expires: 30, path: ""
    });

    setPatientList(patientListCopy);
    setPatientInfo(now.toLocaleDateString());
    setEditState(0);
    setEditPatientIndex(patientListCopy.length-1)
  }

  function handleSaveTable() {
    const data = patientList.map((info, index) => {
      let dict = {};
      const lines = info.split("\n");

      for(let i = 0; i < NUMBER_OF_COLUMNS; i++) {
        dict[HEADERS.at(i)] = lines.at(i);
      }

      return dict;
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ER Weekly Patient List");

    XLSX.writeFile(workbook, filename + ".xlsx", {
      compression: true
    });
  }

  const headers = HEADERS.map((header, index) =>
    <th key={index}>{header}</th>
  );

  const patientListColumns = patientList.map((info, index) => {
    const lines = info.split("\n");

    const columns = lines.map((line, index) =>
      <td key={index}>{line}</td>
    );

    if(editState && editPatientIndex === index) {
      if(addPatientLabel === "Save Edits") {
        return (
          <tr key={index} className="table-success" onClick={() => handleEditButton(info, index)}>
            {columns}
          </tr>
        );
      } else {
        return (
          <tr key={index} className="table-danger" onClick={() => handleEditButton(info, index)}>
            {columns}
          </tr>
        );
      }
    } else {
      return (
        <tr key={index} onClick={() => handleEditButton(info, index)}>
          {columns}
        </tr>
      );
    }
  });

  return (
    <>
      <Container>
        <div className="table-wrap" style={{height: tableHeight}}>
          <Table hover responsive className="mt-3 mb-3">
            <thead className="thead-light">
              <tr>
                {headers}
              </tr>
            </thead>
            <tbody>
              {patientListColumns}
            </tbody>
          </Table>
        </div>
      </Container>
      <footer className="footer">
        <Container>
          <InputGroup className="mb-2">
            <InputGroup.Text>Patients: {editPatientIndex+1}/{patientList.length}</InputGroup.Text>
            <Form.Control
              placeholder="Filename"
              value={filename}
              onChange={e => setFilename(e.target.value)}
            />
            <InputGroup.Text>.xlsx</InputGroup.Text>
            <Button variant="secondary" onClick={() => handleSaveTable()}>
              <DownloadIcon size={24} />
            </Button>
          </InputGroup>
          <InputGroup>
            <Form.Control
              as="textarea"
              rows={NUMBER_OF_COLUMNS}
              value={patientInfo}
              onChange={e => handleInfoChange(e.target.value)}
            />
            {editState === 0 &&
              <Button variant="secondary"  onClick={() => handleAddPatient()}>
                <PlusCircleIcon size={24} />
              </Button>
            }
            {editState === 1 &&
              <Button variant="success"  onClick={() => handleAddPatient()}>
                <IssueClosedIcon size={24} />
              </Button>
            }
            {editState === 2 &&
              <Button variant="danger"  onClick={() => handleAddPatient()}>
                <XCircleIcon size={24} />
              </Button>
            }
          </InputGroup>
        </Container>
      </footer>
    </>
  );
}
