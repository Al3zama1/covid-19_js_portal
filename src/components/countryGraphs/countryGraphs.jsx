import React, { useEffect } from "react";
import * as d3 from "d3";
import "./countryGraphs.css";

function CountryGraphs() {
  useEffect(() => {
    var dat =
      "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/owid-covid-data.csv";
    var l = "United States";
    var jhu = 
    "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/";

    var parseDate = d3.timeParse("%Y-%m-%d");
    let date = getPreviousDate(parseDate);
    date = getDateString(date);
    
    jhu += date + ".csv";
    let country = "US"

    jhuTreeMapD(jhu, "C", country); 
    owidCountryD(dat, l);
  });

  function jhuTreeMapD(dat, type, country){
    const margin = 5,
        width = 1000 - (margin*2),
        height = 400 - (margin*2);
  
    const div = d3.select(".graphic").select("#treeMap")
  
    let title = div
    .append("h2")
    .attr("width", "100px")
    .attr("display", "block")
    .attr("margin", "auto")
    .attr("stroke", "black")
    .text("Confirmed covid cases in " + country);
  
  
    const svg = div
    .append("svg")
    .attr("width", width + (margin * 2))
    .attr("height", height + (margin * 2))
    .append("g")
    .attr("transform",
            `translate(${margin}, ${margin})`);
        
    d3.csv(dat).then(function(data) {
        data = d3.filter(data, function(d){return d.Province_State != ""});
        data = d3.filter(data, function(d){return d.Province_State != "Unknown"});
  
        let dataP = [...data];
        let allLocations = new Set(data.map(d => d.Country_Region))
  
        d3.select("#selectCountryT")
        .selectAll('myOptions')
           .data(allLocations)
            .enter()
            .append('option')
            .text(function (d) { return d;}) 
            .attr("value", function (d) { return d;})
  
        data = d3.filter(data, function(d){return d.Country_Region == country});
  
        let css;
        switch(type){
            case "D":
                data = d3.rollup(data, v => d3.sum(v, d => d.Deaths), d => d.Country_Region + "_root", d => d.Province_State);
                css = "deaths"
                break;
            case "C":
                css = "confirmed"
                data = d3.rollup(data, v => d3.sum(v, d => d.Confirmed), d => d.Country_Region + "_root", d => d.Province_State);
                break;
        }
  
        data = unroll(data, ["parent", "name"], "value");   
       
        data = sortDescending(data);
        
        data.unshift({parent: "", name: country + "_root", value: null}); 
  
        let root = d3.stratify()
            .id(function(d) {return d.name;})   
            .parentId(function(d){return d.parent;})   
            (data);
            
        root.sum(function(d) { return +d.value })   
  
        d3.treemap()    
            .size([width, height])
            .padding(4)
            (root)  
        svg
            .selectAll("rect")
            .data(root.leaves())
            .join("rect")
            .attr('x', function (d) { return d.x0; })
            .attr('y', function (d) { return d.y0; })
            .attr('width', function (d) { return d.x1 - d.x0; })
            .attr('height', function (d) { return d.y1 - d.y0; })
            .attr("class", css);
  
        svg
            .selectAll("text")
            .data(root.leaves())
            .join("text")
            .attr("x", function(d){ return d.x0+10})    
            .attr("y", function(d){ return d.y0+20})     
            .text(function(d){  
                let label = d.data.name;
                let size = label.length * 15;
                if(size > d.x1 - d.x0){
                    size -= (d.x1 - d.x0);
                    return "";
                }else{
                return d.data.name;}})
            .attr("font-size", "15px")
            .attr("fill", "white")
  
            function update(country, type){
                switch(type){
                    case "D":
                        title.text("Deaths due to covid in " + country);
                        break;
                    case "C":
                        title.text("Confirmed covid cases in " + country);
                        break;
                }
                
                data = dataP;
                data = d3.filter(data, function(d){return d.Country_Region == country});
  
                switch(type){
                    case "D":
                        data = d3.rollup(data, v => d3.sum(v, d => d.Deaths), d => d.Country_Region + "_root", d => d.Province_State);
                        css = "deaths"
                        break;
                    case "C":
                        css = "confirmed"
                        data = d3.rollup(data, v => d3.sum(v, d => d.Confirmed), d => d.Country_Region + "_root", d => d.Province_State);
                        break;
                }
  
                data = unroll(data, ["parent", "name"], "value");   
  
                data = sortDescending(data);
                data.unshift({parent: "", name: country + "_root", value: null}); 
  
                root = d3.stratify()
                    .id(function(d) {return d.name;})   
                    .parentId(function(d){return d.parent;})   
                    (data);
                    
                root.sum(function(d) { return +d.value })   
  
                d3.treemap()    
                    .size([width, height])
                    .padding(4)
                    (root)  
  
                svg
                    .selectAll("rect")
                    .data(root.leaves())
                    .join("rect")
                    .attr('x', function (d) { return d.x0; })
                    .attr('y', function (d) { return d.y0; })
                    .attr('width', function (d) { return d.x1 - d.x0; })
                    .attr('height', function (d) { return d.y1 - d.y0; })
                    .attr("class", css);
  
                svg
                    .selectAll("text")
                    .data(root.leaves())
                    .join("text")
                    .attr("x", function(d){ return d.x0+10})  
                    .attr("y", function(d){ return d.y0+20})     
                    .text(function(d){  
                        let label = d.data.name;
                        let size = label.length * 15;
                        if(size > d.x1 - d.x0){
                            size -= (d.x1 - d.x0);
                            return "";
                        }else{
                        return d.data.name;}})
                    .attr("font-size", "15px")
                    .attr("fill", "white")
                }
  
            d3.select("#selectCountryT").on("change", function(Event,d){
                let country = d3.select(this).property("value"),
                types = document.getElementsByName("CDtoggleT");
                let t;
  
                for(let i = 0; i < types.length; i++){
                    if(types[i].checked){
                        t = types[i].value;
                    }      
                }
                update(country, t)
            });
  
            d3.select("#togglebttnT").on("click", function(Event,d){
                let select = document.getElementById("selectCountryT"),
                    country = select.options[select.selectedIndex].text;
                if(country == "Select an Option"){
                   return;
                }
                let t = document.getElementsByName("CDtoggleT");
                let type;
  
                for(let i = 0; i < t.length; i++){
                    if(t[i].checked){
                        type = t[i].value;
                    }      
                }
                update(country, type)
            });
  
        });
      }

  function owidCountryD(dat, l) {
    const margin = 200,
      width = 1000 - margin,
      height = 400 - margin

    var div = d3.select(".graphic").select("#lineGraph")

    let title = div
    .append("h2")
    .attr("width", "100px")
    .attr("display", "block")
    .attr("margin", "auto")
    .attr("stroke", "black")
    .text("Confirmed covid cases in " + l);

    var svg = div
    .append("svg")
    .attr("width", 1000)
    .attr("height", 500);

    var parseDate = d3.timeParse("%Y-%m-%d");

    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    let valueline = d3
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

      var allLocations = new Set(data.map((d) => d.location));

      d3.select("#selectCountryL")
        .selectAll("myOptions")
        .data(allLocations)
        .enter()
        .append("option")
        .text(function (d) {
          return d;
        })
        .attr("value", function (d) {
          return d;
        })
        ;

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
        .attr("class", "line")
        .attr("d", valueline);

      var xaxis = g
        .append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

      var yaxis = g.append("g").call(d3.axisLeft(y));

      function update(nl, type) {
        var df = filterLocation(data, nl);
        switch(type){

          case("C"):
          df.forEach(function (d) {
            d.date = d.date;
            d.total_cases = +d.total_cases;
          });

          x.domain(
            d3.extent(df, function (d) {
              return d.date;
            })
          );
          
          y.domain([
            0,
            d3.max(df, function (d) {
              return d.total_cases;
            }),
          ]);
  
          valueline = d3
            .line()
            .x(function (d) {
              return x(d.date);
            })
            .y(function (d) {
              return y(d.total_cases);
            });
  
          title.text("Covid-19 in " + nl);
  
          line
            .data([df])
            .transition()
            .duration(1000)
            .attr("d", valueline)
            .attr("class", "c");
            break;

          case("D"):
          df.forEach(function (d) {
            d.date = d.date;
            d.total_deaths = +d.total_deaths;
          });

          x.domain(
            d3.extent(df, function (d) {
              return d.date;
            })
          );
          
          y.domain([
            0,
            d3.max(df, function (d) {
              return d.total_deaths;
            }),
          ]);
  
          valueline = d3
            .line()
            .x(function (d) {
              return x(d.date);
            })
            .y(function (d) {
              return y(d.total_deaths);
            });
  
          title.text("Covid-19 in " + nl);
  
          line
            .data([df])
            .transition()
            .duration(1000)
            .attr("d", valueline)
            .attr("class", "d");
            break;
        }


        xaxis.transition().duration(1000).call(d3.axisBottom(x));
        yaxis.transition().duration(1000).call(d3.axisLeft(y));
      }

      d3.select("#selectCountryL").on("change", function (Event, d) {
        var location = d3.select(this).property("value");
        console.log(location);

        let t = document.getElementsByName("CDtoggleL");
        let type;

        for(let i = 0; i < t.length; i++){
            if(t[i].checked){
                type = t[i].value;
            }      
        }
        update(location, type);
      });

      d3.select("#togglebttnL").on("click", function(Event,d){
        let select = document.getElementById("selectCountryL"),
            location = select.options[select.selectedIndex].text;
        if(location == "Select an Option"){
           return;
        }
        let t = document.getElementsByName("CDtoggleL");
        let type;

        for(let i = 0; i < t.length; i++){
            if(t[i].checked){
                type = t[i].value;
            }      
        }
        update(location, type)
    });

    });
  }

  function unroll(rollup, keys, label = "value", p = {}) {    
    return Array.from(rollup, ([key, value]) => 
    value instanceof Map 
        ? unroll(value, keys.slice(1), label, Object.assign({}, { ...p, [keys[0]]: key } ))
        : Object.assign({}, { ...p, [keys[0]]: key, [label] : value })
    ).flat();
}

function sortDescending(data){
    return data.sort(function(a,b) { return -a.value - -b.value });
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

  function getTodaysDate(){
    let today = new Date();
    let date = today;
    return date;
  }
  
  function getPreviousDate(parseDate){
    let today = getTodaysDate();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); 
    let yyyy = today.getFullYear();
  
    dd = dd - 1;
  
    let date = parseDate(yyyy + "-" + mm + "-" + dd);
    return date;
  }
  
  function getDateString(date){
    let dd = String(date.getDate()).padStart(2, '0');
    let mm = String(date.getMonth() + 1).padStart(2, '0'); 
    let yyyy = date.getFullYear();
  
    return mm + "-" + dd + "-" + yyyy;
  }

  return (
      <div className="graphic">
        <div id="treeMap">
          <div className="ui">
          <input type="radio" class="toggle" name="CDtoggleT" value="C" checked></input>
                <label>Confirmed</label>
                <input type="radio" class="toggle" name="CDtoggleT" value="D"></input>
                <label>Deaths</label>
                <button id="togglebttnT">toggle</button>
            <select id="selectCountryT">
                <option value="none" selected disabled hidden>
                    Select an Option
                </option>
            </select>
          </div>
        </div>
        <div id="lineGraph">
          <div className="ui">
          <input type="radio" className="toggle" name="CDtoggleL" value="C" checked></input>
                <label>Confirmed</label>
                <input type="radio" className="toggle" name="CDtoggleL" value="D"></input>
                <label>Deaths</label>
                <button id="togglebttnL">toggle</button>
          <select id="selectCountryL">
            <option value="none" selected disabled hidden>
                Select an Option
            </option>
        </select></div>
          </div>
    </div>
  );
}

export default CountryGraphs;
