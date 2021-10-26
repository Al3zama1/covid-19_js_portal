import React, { useState, useEffect } from "react";
import Header from "./components/header/Header";
import Graphs from "./components/Graphs";

function App() {
  const [graph, setGraph] = useState("continentGraphs");
  const [data, setData] = useState([]);

  return (
    <div className="App">
      <Header />
      <h1>Select Graph to Display</h1>
      <form>
        <select
          name="graphs"
          id="dataGraphs"
          onChange={(event) => setGraph(event.target.value)}
        >
          <option value="continentGraphs">Continent</option>
          <option value="countryGraphs">Country</option>
          <option value="usGraphs">US</option>
        </select>
      </form>

      <Graphs graph={graph} />
    </div>
  );
}

export default App;
