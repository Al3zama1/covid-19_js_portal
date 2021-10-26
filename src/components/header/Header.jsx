import React from "react";
import "./header.css";

function Header() {
  return (
    <div id="header">
      <h1>Covid-19 Portal</h1>
      <nav id="nav">
        <ul id="header_items">
          <li className="header_item">
            <a href="#">Visualizations</a>
          </li>
          <li className="header_item">
            <a href="#">About</a>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Header;
