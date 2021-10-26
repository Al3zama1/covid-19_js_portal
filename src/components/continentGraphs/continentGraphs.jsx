import React, { useEffect } from "react";
import * as d3 from "d3";

function ContinentGraphs() {
  var spacing = null;

  useEffect(() => {
    var owid =
      "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/owid-covid-data.csv";

      var today = new Date();
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0'); 
      var yyyy = today.getFullYear();
          
      today = yyyy + '-' + mm + '-' + (dd-1);

    totalC(owid, today, "C");
    totalC(owid, today, "D")
    owidCovidContinentC(owid);
    owidCovidContinentD(owid);
}, []);

function totalC(dat ,today, type){
  let div = d3.select(".graphic").append("div").attr("width","200px").attr("margin","auto").attr("text-align", "center");
  let d;
  d3.csv(dat).then(function(data){
      data = data.filter(function(d){return d.date == today});
      data = data.filter(function(d){return d.continent != ""});
      switch(type){
          case("C"):
              d = d3.rollup(data, v => d3.sum(v, d => d.total_cases), d => d.continent);
          
              data = unroll(d, ["continent"], "total_cases");
              data = d3.sum(data, d => d.total_cases);
          
              div.append("span").text("CONFIRMED COVID CASES WORLDWIDE: ").append("span").text(data);;
          break;
          case("D"):
              d = d3.rollup(data, v => d3.sum(v, d => d.total_deaths), d => d.continent);
          
              data = unroll(d, ["continent"], "total_deaths");
              data = d3.sum(data, d => d.total_deaths);
      
              div.append("span").text("DEATHS DUE TO COVID WORLDWIDE: ").append("span").text(data);
          break;
      }
  });
}

  function owidCovidContinentC(dat) {
    var title = "COVID-19 cases by Continent",
      xtitle = "Continent",
      ytitle = "Confirmed";
    spacing = 0.4;

    var graphDiv = d3.select(".graphic").append("div");

    var svg = graphDiv.append("svg").attr("width", 1000).attr("height", 500),
      margin = 225,
      width = svg.attr("width") - (margin - 100),
      height = svg.attr("height") - margin;

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var yyyy = today.getFullYear();

    today = yyyy + "-" + mm + "-" + (dd - 1);

    //Title of Graph
    svg
      .append("text")
      .attr("transform", "translate(100,50)")
      .attr("font-size", "24px")
      .text(title);

    var g = svg.append("g").attr("transform", "translate(100,100)");

    var xscale = d3.scaleBand().range([0, width]).padding(spacing),
      yscale = d3.scaleLinear().range([height, 0]);

    d3.csv(dat).then(function (data) {
      data = data.filter(function (d) {
        return d.continent != "";
      });
      data = data.filter(function (d) {
        return d.date == today;
      });

      var d = d3.rollup(
        data,
        (v) => d3.sum(v, (d) => d.total_cases),
        (d) => d.continent
      );
      data = unroll(d, ["continent"], "total_cases");
      
      data = sortDescendingC(data);

      xscale.domain(
        data.map(function (d) {
          return d.continent;
        })
      );
      yscale.domain([
        0,
        d3.max(data, function (d) {
          return +d.total_cases;
        }),
      ]);

      var xaxis = g
        .append("g")
        .attr("transform", `translate(0,${height + 10})`)
        .call(d3.axisBottom(xscale))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

      //X-Axis Title
      g.append("text")
        .attr("font-family", "Arial")
        .attr("font-size", "12px")
        .attr("x", width - 30)
        .attr("y", height + 100)
        .attr("stroke", "black")
        .text(xtitle);

      var yaxis = g
        .append("g")
        .call(
          d3
            .axisLeft(yscale)
            .tickFormat(function (d) {
              return d;
            })
            .ticks(10)
        )
        .append("text")
        .attr("font-family", "Arial")
        .attr("font-size", "12px")
        .attr("stroke", "black")
        .attr("transform", "rotate(-90)")
        .attr("y", 10)
        .attr("dy", "-5em")
        .attr("text-anchor", "end");

      //Y-Axis Title
      g.append("text")
        .attr("font-family", "Arial")
        .attr("font-size", "12px")
        .attr("x", margin * -1 + 170)
        .attr("y", "-65")
        .attr("stroke", "black")
        .text(ytitle)
        .attr("transform", "rotate(-90)");

      g.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("fill", "#ff6361")
        .attr("x", function (d) {
          return xscale(d.continent);
        })
        .attr("y", function (d) {
          return yscale(d.total_cases);
        })
        .attr("width", xscale.bandwidth())
        .attr("height", function (d) {
          return height - yscale(d.total_cases);
        });
    });
  }

  function owidCovidContinentD(dat) {
    var title = "Covid-19 Deaths by Continent",
      xtitle = "Continent",
      ytitle = "Deaths";
      spacing = 0.4;

    var graphDiv = d3.select(".graphic").append("div");

    var svg = graphDiv.append("svg").attr("width", 1000).attr("height", 500),
      margin = 225,
      width = svg.attr("width") - (margin - 100),
      height = svg.attr("height") - margin;

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var yyyy = today.getFullYear();

    today = yyyy + "-" + mm + "-" + (dd - 1);

    //Title of Graph
    svg
      .append("text")
      .attr("transform", "translate(100,50)")
      .attr("font-family", "Arial")
      .attr("font-size", "24px")
      .text(title);

    var g = svg.append("g").attr("transform", "translate(100,100)");

    var xscale = d3.scaleBand().range([0, width]).padding(spacing),
      yscale = d3.scaleLinear().range([height, 0]);

    d3.csv(dat).then(function (data) {
      data = data.filter(function (d) {
        return d.continent != "";
      });
      data = data.filter(function (d) {
        return d.date == today;
      });

      var d = d3.rollup(
        data,
        (v) => d3.sum(v, (d) => d.total_deaths),
        (d) => d.continent
      );
      data = unroll(d, ["continent"], "total_deaths");
      
      data = sortDescendingD(data);

      xscale.domain(
        data.map(function (d) {
          return d.continent;
        })
      );
      yscale.domain([
        0,
        d3.max(data, function (d) {
          return +d.total_deaths;
        }),
      ]);

      var xaxis = g
        .append("g")
        .attr("transform", `translate(0,${height + 10})`)
        .call(d3.axisBottom(xscale))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

      //X-Axis Title
      g.append("text")
        .attr("font-family", "Arial")
        .attr("font-size", "12px")
        .attr("x", width - 30)
        .attr("y", height + 100)
        .attr("stroke", "black")
        .text(xtitle);

      var yaxis = g
        .append("g")
        .call(
          d3
            .axisLeft(yscale)
            .tickFormat(function (d) {
              return d;
            })
            .ticks(10)
        )
        .append("text")
        .attr("font-family", "Arial")
        .attr("font-size", "12px")
        .attr("stroke", "black")
        .attr("transform", "rotate(-90)")
        .attr("y", 10)
        .attr("dy", "-5em")
        .attr("text-anchor", "end");

      //Y-Axis Title
      g.append("text")
        .attr("font-family", "Arial")
        .attr("font-size", "12px")
        .attr("x", margin * -1 + 170)
        .attr("y", "-65")
        .attr("stroke", "black")
        .text(ytitle)
        .attr("transform", "rotate(-90)");

      g.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("fill", " #181a18")
        .attr("x", function (d) {
          return xscale(d.continent);
        })
        .attr("y", function (d) {
          return yscale(d.total_deaths);
        })
        .attr("width", xscale.bandwidth())
        .attr("height", function (d) {
          return height - yscale(d.total_deaths);
        });
    });
  }

function sortDescendingC(data){
    return data.sort(function(a,b) { return -a.total_cases - -b.total_cases});
  }
  

function sortDescendingD(data){
    return data.sort(function(a,b) { return -a.total_deaths - -b.total_deaths});
  }

  //https://observablehq.com/@bayre/unrolling-a-d3-rollup
  function unroll(rollup, keys, label = "value", p = {}) {
    return Array.from(rollup, ([key, value]) =>
      value instanceof Map
        ? unroll(
            value,
            keys.slice(1),
            label,
            Object.assign({}, { ...p, [keys[0]]: key })
          )
        : Object.assign({}, { ...p, [keys[0]]: key, [label]: value })
    ).flat();
  }

  return <div className="graphic"></div>;
}

export default ContinentGraphs;
