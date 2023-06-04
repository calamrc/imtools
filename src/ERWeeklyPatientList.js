import './ERWeeklyPatientList.css';
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import {
  PlusCircleIcon,
  IssueClosedIcon,
  XCircleIcon,
  DownloadIcon,
  KebabHorizontalIcon,
} from "@primer/octicons-react"
import * as XLSX from "xlsx";
import Container from "react-bootstrap/Container";
import Table from "react-bootstrap/Table";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Modal from "react-bootstrap/Modal";

const NUMBER_OF_COLUMNS = 6;
const HEADERS = [
  "Date",
  "Name",
  "Age/Sex",
  "Chief Complaint",
  "Diagnosis",
  "Disposition"
]

const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
  <Button
    variant="light"
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      onClick(e);
    }}>
    {children}
  </Button>
));


const ERWeeklyPatientList = () => {
  const tablePrefix = "table-";
  const offset = 160 + 100;
  const [tableHeight, setTableHeight] = useState((window.innerHeight-offset).toString() + "px");

  useEffect(() => {
    const handleResize = () => {
      setTableHeight((window.innerHeight-offset).toString() + "px");
    }
    window.addEventListener("resize", handleResize)
  });

  const now = new Date();
  const currentDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const defaultTableName = "ERPatientList-" + currentDate.replaceAll("/", "");
  const [tableName, setTableName] = useState(defaultTableName);

  const [patientList, setPatientList] = useState(() => {
    const lastOpenedTable = Cookies.get("lastOpenedTable");
    const tableContent = Cookies.get(tablePrefix + lastOpenedTable, {
      path: "",
    });

    if(tableContent === undefined) {
      setTableName(defaultTableName);
      Cookies.set("lastOpenedTable", defaultTableName, {
        expires: 30,
        path: "",
      });
      return [];
    } else {
      setTableName(lastOpenedTable);
      return JSON.parse(tableContent);
    }
  });

  const [patientInfo, setPatientInfo] = useState(now.toLocaleDateString());
  const [editState, setEditState] = useState(0);
  const [editPatientIndex, setEditPatientIndex] = useState(patientList.length-1);
  const [addPatientLabel, setAddPatientLabel] = useState("Add Patient to List");

  const [modalTitle, setModalTitle] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSortDialog, setShowSortDialog] = useState(false);

  const dropdownItems = [
    {
      name: "New",
      callback: setShowNewDialog,
    },
    {
      name: "Open",
      callback: setShowOpenDialog,
    },
    {
      name: "Save",
      callback: setShowSaveDialog,
    },
    {
      name: "Delete",
      callback: setShowDeleteDialog,
    },
    {
      name: "Sort",
      callback: setShowSortDialog,
    },
  ];


  const handleNewTable = () => {
    setPatientList([]);
    setEditState(0);
    setEditPatientIndex(-1);
  }

  const handleOpenTable = () => {

  }

  const handleSaveTable = () => {
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
    XLSX.writeFile(workbook, tableName + ".xlsx", {
      compression: true
    });

    setShowModal(false);
  }

  const handleDeleteTable = () => {

  }

  const saveTableToCookie = (table) => {
    Cookies.set(tablePrefix + tableName, JSON.stringify(table), {
      expires: 30,
      path: ""
    });
  }

  const handleInfoChange = (value) => {
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

  const handleEditButton = (info, index) => {
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

  const handleAddPatient = () => {
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

    saveTableToCookie(patientListCopy);
    setPatientList(patientListCopy);
    setPatientInfo(now.toLocaleDateString());
    setEditState(0);
    setEditPatientIndex(patientListCopy.length-1)
  }

  const generateDropdownItems = dropdownItems.map((item, index, items) => 
    <Dropdown.Item key={index} href="#" onClick={(e) => {
      setModalTitle(item.name + " table...");
      setShowModal(true);

      items.map(it => {
        if(e.target.text === it.name) {
          it.callback(true);
        } else {
          it.callback(false);
        }

        return it;
      });
    }}>{item.name}</Dropdown.Item>
  );

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
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        dialogClassName="modal-90w"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {modalTitle}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {
            showSaveDialog &&
              <InputGroup className="mb-2">
                <Form.Control
                  placeholder="Tablename"
                  value={tableName}
                  onChange={e => setTableName(e.target.value)}
                />
                <InputGroup.Text>.xlsx</InputGroup.Text>
                <Button variant="primary" onClick={() => handleSaveTable(true)}>
                  <DownloadIcon size={24} />
                </Button>
              </InputGroup>
          }
        </Modal.Body>
      </Modal>
      <Container>
        <Row className="mt-1 justify-content-between align-items-center">
          <Col className="fw-light">
            <span className="align-middle">{editPatientIndex+1}/{patientList.length}</span>
          </Col>
          <Col xs="auto" className="fw-semibold">
            <span className="align-middle">{tableName}</span>
          </Col>
          <Col className="text-end">
            <Dropdown>
              <Dropdown.Toggle as={CustomToggle} variant="light">
                <KebabHorizontalIcon className="dropdown-toggle" size={24} />
              </Dropdown.Toggle>
              <Dropdown.Menu align="end">
                {generateDropdownItems}
              </Dropdown.Menu>
            </Dropdown>
          </Col>
        </Row>
        <div className="table-wrap" style={{height: tableHeight}}>
          <Table hover responsive className="mt-3 mb-3">
            <thead className="thead-dark">
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
      <footer className="footer" style={{height: tableHeight+50}}>
        <Container>
          <InputGroup>
            <Form.Control
              as="textarea"
              rows={NUMBER_OF_COLUMNS}
              value={patientInfo}
              onChange={e => handleInfoChange(e.target.value)}
            />
            {editState === 0 &&
              <Button variant="primary"  onClick={() => handleAddPatient()}>
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

export default ERWeeklyPatientList;
