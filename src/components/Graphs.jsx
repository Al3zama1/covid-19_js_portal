import React from "react";
import ContinentGraphs from "./continentGraphs/continentGraphs";
import CountryGraphs from "./countryGraphs/countryGraphs";
import USGraphs from "./usGraphs/usGraphs";

function Graphs({ graph }) {
  console.log(graph);
  return (
    <div>
      {graph === "continentGraphs" && <ContinentGraphs />}
      {graph === "countryGraphs" && <CountryGraphs />}
      {graph === "usGraphs" && <USGraphs />}
    </div>
  );
}

export default Graphs;
