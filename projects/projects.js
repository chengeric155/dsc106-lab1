import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

let base = document.querySelector('base')?.href;

const projects = await fetchJSON(base + 'lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

const header = document.querySelector('.projects-title')
if (header) {
    header.textContent = projects.length + " " + header.textContent
}

// pie chart
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

let query = '';

let searchInput = document.querySelector('.searchBar');

function renderPieChart(projectsGiven) {

    d3.select('svg').selectAll('*').remove();
    d3.select('.legend').selectAll('*').remove();
    // re-calculate rolled data
    let newRolledData = d3.rollups(
      projectsGiven,
      (v) => v.length,
      (d) => d.year,
    );

    // re-calculate data
    let newData = newRolledData.map(([year, count]) => {
      return { value: count, label: year };
    });

    // re-calculate slice generator, arc data, arc, etc.
    let newSliceGenerator = d3.pie().value((d) => d.value);
    let newArcData = newSliceGenerator(newData);
    let newArcs = newArcData.map((d) => arcGenerator(d));
    // TODO: clear up paths and legends

    // update paths and legends, refer to steps 1.4 and 2.2
    let colors = d3.scaleOrdinal(d3.schemeTableau10);

    let selectedIndex = -1;  // Keep track of the selected slice
    let svg = d3.select('svg');

    newArcs.forEach((arc, i) => {
        svg
          .append('path')
          .attr('d', arc)
          .attr('fill', colors(i))
          .on('click', () => {
            selectedIndex = selectedIndex === i ? -1 : i;

            svg.selectAll('path').attr('class', (_, i) => i === selectedIndex ? 'selected' : 'unselected');
            legend.selectAll('li').attr('class', (_, i) => i === selectedIndex ? 'selected' : 'unselected');

            if (selectedIndex === -1) {
                  renderProjects(projectsGiven, projectsContainer, 'h2');
            } else {
                const selectedYear = newData[selectedIndex].label;
                const filteredProjects = projectsGiven.filter(project => project.year === selectedYear);
                renderProjects(filteredProjects, projectsContainer, 'h2');
            }
          });
    });

    // Update legend
    let legend = d3.select('.legend');
    newData.forEach((d, idx) => {
        legend.append('li')
            .attr('style', `--color:${colors(idx)}`)
            .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
    });
}
  
// Call this function on page load
renderPieChart(projects);

searchInput.addEventListener('input', (event) => {
    // let filteredProjects = setQuery(event.target.value);
    let query = event.target.value.toLowerCase();
    let filteredProjects = projects.filter((project) => {
        let values = Object.values(project).join(' ').toLowerCase();
        return values.includes(query);
    });

    // re-render legends and pie chart when event triggers
    renderProjects(filteredProjects, projectsContainer, 'h2');
    renderPieChart(filteredProjects);
});
