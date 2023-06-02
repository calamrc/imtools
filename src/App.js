import './App.css';
import { useState } from "react";
import ERWeeklyPatientList from "./ERWeeklyPatientList";
import { ThreeBarsIcon } from "@primer/octicons-react";

export default function App() {
  const [navbarCollapsed, setNavbarCollapsed] = useState(true);
  const [showHome, setShowHome] = useState(true)
  const [showERWeeklyPatientList, setShowWeeklyPatientList] = useState(false)

  const itemList = [
    setShowHome,
    setShowWeeklyPatientList
  ];

  function setItemActive(index) {
    itemList.map((setter, i) => {
      if(index == i) {
        setter(true);
      } else {
        setter(false);
      }
    });

    setNavbarCollapsed(true);
  }

  return (
    <>
      <nav className="navbar navbar-dark bg-dark">
        <a className="navbar-brand" href="#">IM Tools</a>
        <button className="navbar-toggler" onClick={() => setNavbarCollapsed(() => navbarCollapsed ^ true)}>
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={navbarCollapsed ? "navbar-collapse collapse" : "navbar-collapse"}>
          <ul className="navbar-nav mr-auto mt-2 mt-lg-0">
            <li className={showHome ? "nav-item active" : "nav-item"} >
              <a className="nav-link" href="#" onClick={() => setItemActive(0)}>Home</a>
            </li>
            <li className={showERWeeklyPatientList ? "nav-item active" : "nav-item"} >
              <a className="nav-link" href="#" onClick={() => setItemActive(1)}>ER Weekly Patient List</a>
            </li>
          </ul>
        </div>
      </nav>
      <div className="container">
        { showERWeeklyPatientList && <ERWeeklyPatientList />}
      </div>
    </>
  );
}

