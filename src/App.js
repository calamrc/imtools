import './App.css';
import { useState } from "react";
import ERWeeklyPatientList from "./ERWeeklyPatientList";
import { ThreeBarsIcon } from "@primer/octicons-react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";

export default function App() {
  const [brand, setBrand] = useState("Home")
  const [showHome, setShowHome] = useState(true)
  const [showERWeeklyPatientList, setShowWeeklyPatientList] = useState(false)

  const itemList = [{
    name: "Home",
    setter: setShowHome,
  },  {
    name: "ER Weekly Patient List",
    setter: setShowWeeklyPatientList,
  }
  ];

  function setItemActive(index) {
    itemList.map((item, i) => {
      if(index == i) {
        setBrand(item.name)
        item.setter(true);
      } else {
        item.setter(false);
      }
    });
  }

  return (
    <>
      <header>
        <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
          <Container>
            <Navbar.Brand href="#">{brand}</Navbar.Brand>
            <Navbar.Toggle />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link href="#" onClick={() => setItemActive(0)}>{itemList[0].name}</Nav.Link>
                <Nav.Link href="#" onClick={() => setItemActive(1)}>{itemList[1].name}</Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </header>
      { showERWeeklyPatientList && <ERWeeklyPatientList /> }
    </>
  );
}

