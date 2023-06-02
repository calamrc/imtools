import './ERWeeklyPatientList.css';
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import * as XLSX from "xlsx";

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
  const [patientInfo, setPatientInfo] = useState(now.toLocaleDateString());
  const [patientList, setPatientList] = useState(() => {
    const cookie = Cookies.get("patientList");
    if(cookie === undefined) {
      return [];
    } else {
      return JSON.parse(cookie);
    }
  });
  const [editState, setEditState] = useState(false);
  const [editPatientIndex, setEditPatientIndex] = useState(0);
  const [addPatientLabel, setAddPatientLabel] = useState("Add Patient to List");
  const [title, setTitle] = useState("IM Tools")
  const [filename, setFilename] = useState("ERWeeklyPatientList-" + now.toJSON().slice(0, 10));
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteLabel, setDeleteLabel] = useState("Delete Table");

  useEffect(() => {
    document.title = title;
  }, [title]);

  function handleDeleteTable() {
    if(confirmDelete) {
      Cookies.remove("patientList");
      setPatientList([]);
      setDeleteLabel("Delete Table")
      setConfirmDelete(false);
    } else {
      setDeleteLabel("Confirm Delete")
      setConfirmDelete(true);
    }
  }

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
    setPatientInfo(info.trim());
    setEditPatientIndex(index);
    setEditState(true);
    setAddPatientLabel("Save Edits");
  }

  function handleAddPatient() {
    let patientInfoCopy = patientInfo;

    patientInfoCopy = patientInfoCopy.trim();

    let patientListCopy;

    if(patientInfoCopy !== "") {
      const lines = patientInfoCopy.split("\n");

      for(let i = lines.length; i < NUMBER_OF_COLUMNS; i++) {
        patientInfoCopy += "\n";
      }

      if(editState) {
        patientListCopy = [...patientList];
        patientListCopy.splice(editPatientIndex, 1, patientInfoCopy);
      } else {
        patientListCopy = [...patientList, patientInfoCopy];
      }

    } else {
      patientListCopy = [...patientList];
      patientListCopy.splice(editPatientIndex, 1);
    }

    Cookies.set("patientList", JSON.stringify(patientListCopy), {
      expires: 7, path: ""
    });

    setPatientList(patientListCopy);
    setPatientInfo(now.toLocaleDateString());
    setEditState(false);
    setAddPatientLabel("Add Patient to List");
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
      <div className="row">
        <div className="col">
          <h1>
            ER Weekly Patient List
          </h1>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <textarea className="form-control"
            rows={NUMBER_OF_COLUMNS}
            cols={50}
            value={patientInfo}
            onChange={e => handleInfoChange(e.target.value)}
          />
        </div>
      </div>
      <div className="row justify-content-between mt-2">
        <div className="col-auto mr-auto">
          <button className="btn btn-primary" onClick={() => handleAddPatient()}>
            {addPatientLabel}
          </button>
        </div>
        <div className="col-auto">
          <button className="btn btn-primary" onClick={() => handleInfoChange("")}>
            Clear Text
          </button>
        </div>
      </div>
      {(patientList.length > 0) && 
      <>
        <div className="row mt-4">
          <div className="col">
            <div className="table-responsive-xl">
              <table className="table">
                <thead className="thead-dark">
                  <tr>
                    {headers}
                  </tr>
                </thead>
                <tbody>
                  {patientListColumns}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="row mt-2">
          <div className="col-auto mb-2">
            <button className="btn btn-primary" onClick={() => handleSaveTable()}>
              Download Excel File
            </button>
          </div>
          <div className="col-auto mr-auto mb-2">
            <div className="input-group">
              <input type="text" className="form-control" placeholder="Filename" value={filename} onChange={e => setFilename(e.target.value)} />
              <div className="input-group-append">
                <span className="input-group-text">.xlsx</span>
              </div>
            </div>
          </div>
          <div className="col-auto mb-2">
            <button className="btn btn-danger" onClick={() => handleDeleteTable()}>
              {deleteLabel}
            </button>
          </div>
        </div>
      </>
      }
    </>
  );
}

