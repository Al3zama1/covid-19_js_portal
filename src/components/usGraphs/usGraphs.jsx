import React, { useEffect } from "react";
import * as d3 from "d3";
import "./usGraphs.css";

function USGraphs() {
  var spacing = null;

  useEffect(() => {
    var owid =
      "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/owid-covid-data.csv";
    var jhu =
      "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/";
    var jhuUS = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports_us/"

    var parseDate = d3.timeParse("%Y-%m-%d");

    var date = getPreviousDate(parseDate);
    var dateString = getDateString(date);

    jhu += dateString + ".csv";
    jhuUS += dateString + ".csv";

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); 
    var yyyy = today.getFullYear();
        
    today = yyyy + '-' + mm + '-' + (dd-1);

    let country = "US";
    let location = "United States";

    jhuCovidCasesUS(jhuUS);
    jhuTreeMap(jhu, "C", "#TreeMapConfirmed", country); 
    jhuTreeMap(jhu, "D", "#TreeMapDeath", country); 
    owidCountryC(owid, location);
    owidCountryD(owid, location);
    owidCovidCountryMonthC(owid, parseDate, location);
    owidCovidCountryMonthD(owid, parseDate, location);
    totalCC(owid, location, today, "C");
    totalCC(owid, location, today, "D");
  });

  function totalCC(dat, country, today, type){
    let div = d3.select(".graphic").select("#total").append("div").attr("width","200px").attr("margin","auto").attr("text-align", "center");
    d3.csv(dat).then(function(data){
      console.log("?")
        data = data.filter(function(d){return d.date == today});
        data = data.filter(function(d){return d.location == country});
        switch(type){
            case("C"):
                data = d3.sum(data, d => d.total_cases);
            
                div.append("span").text("CONFIRMED: ").append("span").text(data);
            break;
            case("D"):

                data = d3.sum(data, d => d.total_deaths);
                console.log(data);
        
                div.append("span").text("DEATHS: ").append("span").text(data);
            break;
        }
    });
}

  function owidCovidCountryMonthC(dat, parseDate, country) {
    var title = "COVID-19 Cases in " + country,
      xtitle = "Date",
      ytitle = "Confirmed";

    var graphDiv = d3.select(".graphic").append("div");

    var svg = graphDiv.append("svg").attr("width", 1000).attr("height", 500),
      margin = 225,
      width = svg.attr("width") - (margin - 100),
      height = svg.attr("height") - margin,
      spacing = 0.4;

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
      var latestDate = getLatestDate(data, parseDate);

      data = filterLocation(data, country);
      data = filterLastDayOfMonth(data, parseDate, latestDate);

      xscale.domain(
        data.map(function (d) {
          return d.date;
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
        .attr("transform", "translate(0," + (height + 10) + ")")
        .call(d3.axisBottom(xscale))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.5em")
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
          return xscale(d.date);
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

  function owidCovidCountryMonthD(dat, parseDate, country) {
    var title = "COVID-19 Deaths in " + country,
      xtitle = "Date",
      ytitle = "Confirmed";

    var graphDiv = d3.select(".graphic").append("div");

    var svg = graphDiv.append("svg").attr("width", 1000).attr("height", 500),
      margin = 225,
      width = svg.attr("width") - (margin - 100),
      height = svg.attr("height") - margin,
      spacing = 0.4;

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
      var latestDate = getLatestDate(data, parseDate);

      data = filterLocation(data, country);
      data = filterLastDayOfMonth(data, parseDate, latestDate);

      xscale.domain(
        data.map(function (d) {
          return d.date;
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
        .attr("transform", "translate(0," + (height + 10) + ")")
        .call(d3.axisBottom(xscale))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.5em")
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
        .attr("fill", "#181a18")
        .attr("x", function (d) {
          return xscale(d.date);
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

  function jhuCovidCasesUS(dat){
    var title = "COVID-19 in the U.S.",
    xtitle = "State",
    ytitle = "Confirmed",
    spacing = 0.4;

    var div = d3.select(".graphic").select("#state");

    var graphDiv = div.append("div");

    var svg = graphDiv.append("svg").attr("width", "1000").attr("height", "500"),
    margin = 225,
    width = svg.attr("width") - (margin-100),
    height = svg.attr("height") - (margin);

    //Title of Graph
    var title = svg.append("text")
        .attr("transform", "translate(100,50)")
        .attr("font-family", "Arial")
        .attr("font-size", "24px")
        .text(title);

    var g = svg.append("g")
        .attr("transform", "translate(100,100)");

    var xscale = d3.scaleBand().range([0, width]).padding(spacing), 
        yscale = d3.scaleLinear().range([height, 0]);

    d3.csv(dat).then( function(data) {

        xscale.domain(data.map(function(d) { return d.Province_State; }));
        yscale.domain([0, d3.max(data, function(d) { return +(d.Confirmed); })]);

        var xaxis = g.append("g")
                    .attr("transform", "translate(0," + (height + 10) + ")")
                    .call(d3.axisBottom(xscale))
                    .selectAll("text")
                    .style("text-anchor", "end")
                    .attr("dx", "-.8em")
                    .attr("dy", ".15em")
                    .attr("transform","rotate(-65)");
        
        //X-Axis Title
        g.append('text')
            .attr("font-family", "Arial")
            .attr("font-size", "12px")
            .attr("x", (width - (30)))
            .attr("y", height + 100)
            .attr("stroke", "black")
            .text(xtitle);
        
        var yaxis = g.append("g")
                    .call(d3.axisLeft(yscale).tickFormat(function(d){return d;}).ticks(10))
                    .append("text")
                    .attr("font-family", "Arial")
                    .attr("font-size", "12px")
                    .attr("stroke", "black")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 10)
                    .attr('dy', '-5em')
                    .attr('text-anchor', 'end');

        //Y-Axis Title
        g.append('text')
            .attr("font-family", "Arial")
            .attr("font-size", "12px")
            .attr("x", ((margin * -1) + 170))
            .attr("y", "-65")
            .attr("stroke", "black")
            .text(ytitle)
            .attr("transform","rotate(-90)");

        g.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("fill", "#ff6361")
            .attr("x", function(d) {return xscale(d.Province_State); })
            .attr("y", function(d)  {return yscale(d.Confirmed); }) 
            .attr("width", xscale.bandwidth())
            .attr("height", function(d){ 
                return height - yscale(d.Confirmed); });

        });
    }

  function jhuTreeMap(dat, type, div, country) {
    // set the dimensions and margins of the graph
    var margin = 5,
      width = 1000 - margin * 2,
      height = 400 - margin * 2;

    // append the svg object to the body of the page

    var div = d3.select("#treemap");

    let title = div
    .append("h2")
    .attr("width", "100px")
    .attr("display", "block")
    .attr("margin", "auto")
    .attr("stroke", "black")

    var svg = div
      .append("svg")
      .attr("width", width + margin * 2)
      .attr("height", height + margin * 2)
      .append("g")
      .attr("transform", `translate(${margin}, ${margin})`);

    switch (type) {
      case "D":
        title.text("Covid deaths in the " + country + " by state");
        break;
      case "C":
        title.text("Confirmed covid cases in the " + country + "  by state");
        break;
    }

    // Read the data
    d3.csv(dat).then(function (data) {
      //Filter data by country
      data = d3.filter(data, function (d) {
        return d.Country_Region === country;
      });

      //Filter data whether type = D (deaths) or type = C (confirmed)
      //Rolls data into a map so that it can be manipulated into a tree map hierarchy
      var css;
      switch (type) {
        case "D":
          data = d3.rollup(
            data,
            (v) => d3.sum(v, (d) => d.Deaths),
            (d) => d.Country_Region,
            (d) => d.Province_State
          );
          css = "deaths";
          break;
        case "C":
          css = "confirmed";
          data = d3.rollup(
            data,
            (v) => d3.sum(v, (d) => d.Confirmed),
            (d) => d.Country_Region,
            (d) => d.Province_State
          );
          break;
      }

      //Unrolls data from a map to an array so that it is usable
      data = unroll(data, ["parent", "name"], "value"); //maintains the tree map hiearchy

      data = sortDescending(data);
      data.unshift({ parent: "", name: country, value: null }); //adds the root entity to data (the country_region of all entities)

      //Stratify the data for Tree hierarchy
      var root = d3
        .stratify()
        .id(function (d) {
          return d.name;
        }) //entity
        .parentId(function (d) {
          return d.parent;
        })(
        //parent
        data
      );

      root.sum(function (d) {
        return +d.value;
      }); // Compute the numeric value for each entity

      //computes the position of each element of the hierarchy
      d3.treemap().size([width, height]).padding(4)(root); //coords added to root object

      // rectangles
      svg
        .selectAll("rect")
        .data(root.leaves())
        .join("rect")
        .attr("x", function (d) {
          return d.x0;
        })
        .attr("y", function (d) {
          return d.y0;
        })
        .attr("width", function (d) {
          return d.x1 - d.x0;
        })
        .attr("height", function (d) {
          return d.y1 - d.y0;
        })
        .attr("class", css);

      // text labels
      svg
        .selectAll("text")
        .data(root.leaves())
        .join("text")
        .attr("x", function (d) {
          return d.x0 + 10;
        }) // adjust x position of label
        .attr("y", function (d) {
          return d.y0 + 20;
        }) // adjust y position of label
        .text(function (d) {
          //returns empty string if the text does not fit in the square
          var label = d.data.name;
          var size = label.length * 15;
          if (size > d.x1 - d.x0) {
            size -= d.x1 - d.x0;
            return "";
          } else {
            return d.data.name;
          }
        })
        .attr("font-size", "15px")
        .attr("fill", "white");
    });
  }

  function owidCountryC(dat, l) {
    var graphDiv = d3.select("#linegraph").append("div");

    var svg = graphDiv.append("svg").attr("width", 900).attr("height", 500),
      margin = 100,
      width = svg.attr("width") - margin,
      height = svg.attr("height") - margin;

    var parseDate = d3.timeParse("%Y-%m-%d");

    const title = svg
      .append("text")
      .attr("transform", "translate(0,0)")
      .attr("x", 25)
      .attr("y", 25)
      .attr("font-family", "Arial")
      .attr("font-size", "24px")
      .text("Covid-19 cases in " + l + " by Month");

    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    var valueline = d3
      .line()
      .x(function (d) {
        return x(d.date);
      })
      .y(function (d) {
        return y(d.total_cases);
      });

    var g = svg
      .append("g")
      .attr("width", width + margin * 2)
      .attr("height", height + margin * 2)
      .attr("transform", "translate(" + 100 + "," + 50 + ")");

    d3.csv(dat).then(function (data) {
      var exclude = [
        "Asia",
        "Africa",
        "Europe",
        "European Union",
        "North America",
        "South America",
        "World",
        "International",
      ];
      data = excludeLocations(data, exclude);

      data.forEach(function (d) {
        d.date = parseDate(d.date);
        d.total_cases = +d.total_cases;
      });

      x.domain(
        d3.extent(data, function (d) {
          return d.date;
        })
      );
      y.domain([
        0,
        d3.max(data, function (d) {
          return d.total_cases;
        }),
      ]);

      const line = g
        .append("path")
        .data([filterLocation(data, l)])
        .attr("class", "c")
        .attr("d", valueline);

      var xaxis = g
        .append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

      var yaxis = g.append("g").call(d3.axisLeft(y));
    });
  }

  function owidCountryD(dat, l) {
    var graphDiv = d3.select("#linegraph").append("div");

    var svg = graphDiv.append("svg").attr("width", 900).attr("height", 500),
      margin = 100,
      width = svg.attr("width") - margin,
      height = svg.attr("height") - margin;

    var parseDate = d3.timeParse("%Y-%m-%d");

    const title = svg
      .append("text")
      .attr("transform", "translate(0,0)")
      .attr("x", 25)
      .attr("y", 25)
      .attr("font-family", "Arial")
      .attr("font-size", "24px")
      .text("Covid-19 deaths in " + l + " by Month");

    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    var valueline = d3
      .line()
      .x(function (d) {
        return x(d.date);
      })
      .y(function (d) {
        return y(d.total_deaths);
      });

    var g = svg
      .append("g")
      .attr("width", width + margin * 2)
      .attr("height", height + margin * 2)
      .attr("transform", "translate(" + 100 + "," + 50 + ")");

    d3.csv(dat).then(function (data) {
      var exclude = [
        "Asia",
        "Africa",
        "Europe",
        "European Union",
        "North America",
        "South America",
        "World",
        "International",
      ];
      data = excludeLocations(data, exclude);

      data.forEach(function (d) {
        d.date = parseDate(d.date);
        d.total_deaths = +d.total_deaths;
      });

      x.domain(
        d3.extent(data, function (d) {
          return d.date;
        })
      );
      y.domain([
        0,
        d3.max(data, function (d) {
          return d.total_deaths;
        }),
      ]);

      const line = g
        .append("path")
        .data([filterLocation(data, l)])
        .attr("class", "d")
        .attr("d", valueline);

      var xaxis = g
        .append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

      var yaxis = g.append("g").call(d3.axisLeft(y));
    });
  }

  function getLatestDate(data, parseDate) {
    return parseDate(d3.max(data, (d) => d.date));
  }

  function isLeapYear(year) {
    return (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
  }

  function filterLastDayOfMonth(data, parseDate, lDate) {
    return d3.filter(data, function (d) {
      var month = [
        "Jan",
        "Feb",
        "March",
        "April",
        "May",
        "June",
        "July",
        "Aug",
        "Sept",
        "Oct",
        "Nov",
        "Dec",
      ];
      var date = parseDate(d.date);

      var day = date.getDate();
      var m = month[parseDate(d.date).getMonth()];
      var y = date.getFullYear();

      if (date.getTime() == lDate.getTime()) {
        return true;
      }

      var leap = isLeapYear(y) ? 28 : 29;

      switch (m) {
        case "Jan":
        case "March":
        case "May":
        case "July":
        case "Aug":
        case "Oct":
        case "Dec":
          return day == 31;
        case "April":
        case "June":
        case "Sept":
        case "Nov":
          return day == 30;
        case "Feb":
          return day == leap;
        default:
          return false;
      }
    });
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

  function getTodaysDate() {
    var today = new Date();
    var date = today;
    return date;
  }

  function getPreviousDate(parseDate) {
    var today = getTodaysDate();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var yyyy = today.getFullYear();

    dd = dd - 1;

    var date = parseDate(yyyy + "-" + mm + "-" + dd);
    return date;
  }

  function getDateString(date) {
    var dd = String(date.getDate()).padStart(2, "0");
    var mm = String(date.getMonth() + 1).padStart(2, "0");
    var yyyy = date.getFullYear();

    return mm + "-" + dd + "-" + yyyy;
  }

  function sortDescending(data) {
    return data.sort(function (a, b) {
      return -a.value - -b.value;
    });
  }

  function excludeLocation(data, l) {
    return d3.filter(data, function (d) {
      return d.location != l;
    });
  }

  function excludeLocations(data, exclude) {
    for (var i = 0; i < exclude.length; i++) {
      data = excludeLocation(data, exclude[i]);
    }
    return data;
  }

  function filterLocation(data, l) {
    return d3.filter(data, function (d) {
      return d.location == l;
    });
  }

  return (
  <div className="graphic">
    <div id="total"></div>
    <div id="state"></div>
    <div id="treemap">
      <div id="TreeMapConfirmed"></div>
      <div id="TreeMapDeath"></div>
    </div>
    <div id="linegraph"></div>
  </div>);
}

export default USGraphs;
