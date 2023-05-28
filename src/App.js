import './App.css';
import { useState } from "react";
import { AiFillEdit } from "react-icons/ai";
import * as XLSX from "xlsx";

const NUMBER_OF_COLUMNS = 6;

function PatientInfo({patientInfo, setPatientInfo}) {
  return (
    <>
      <div>
        <label>
          Patient Information
        </label>
      </div>
      <div>
        <textarea
          rows={NUMBER_OF_COLUMNS}
          cols={50}
          value={patientInfo}
          onChange={e => setPatientInfo(e.target.value)}
        />
      </div>
    </>
  );
}

export default function App() {
  const now = new Date();
  const [patientInfo, setPatientInfo] = useState(now.toLocaleDateString());
  const [patientList, setPatientList] = useState([]);
  const [editState, setEditState] = useState(false);
  const [editPatientIndex, setEditPatientIndex] = useState(0);

  function handleEditButton(info, index) {
    const patientListCopy = [...patientList];
    patientListCopy.splice(index, 1);

    setPatientInfo(info);
    setPatientList(patientListCopy);
    setEditPatientIndex(index);
    setEditState(true);
  }

  function handleAddPatient() {
    if(editState) {
      const patientListCopy = [...patientList];
      patientListCopy.splice(editPatientIndex, 0, patientInfo);
      setPatientList(patientListCopy);
    } else {
      setPatientList([...patientList, patientInfo]);
    }

    setPatientInfo(now.toLocaleDateString());
    setEditState(false);
  }

  const parsedPatientInfo = patientList.map((info, index) => {
    let lines = info.split("\n").map(line =>
      <td key={line}>{line}</td>
    );

    const numberOfLines = lines.length;

    if(numberOfLines < NUMBER_OF_COLUMNS) {
      for(let i = numberOfLines; i < NUMBER_OF_COLUMNS; i++) {
        lines.push(<td key={i}></td>);
      }
    }

    return (
      <tr key={info}>
        {lines}
        <td>
          <button onClick={() => handleEditButton(info, index)}>
            <AiFillEdit />
          </button>
        </td>
      </tr>
    );
  });

  return (
    <>
      <PatientInfo patientInfo={patientInfo} setPatientInfo={setPatientInfo}/>
      <button onClick={handleAddPatient}>Add Patient</button>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Name</th>
            <th>Age/Sex</th>
            <th>Chief Complaint</th>
            <th>Diagnosis</th>
            <th>Disposition</th>
          </tr>
        </thead>
        <tbody>
          {parsedPatientInfo}
        </tbody>
      </table>
    </>
  );
}

