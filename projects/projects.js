import { fetchJSON, renderProjects } from '../global.js';

let base = document.querySelector('base')?.href;

const projects = await fetchJSON(base + 'lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

const header = document.querySelector('.projects-title')
if (header) {
    header.textContent = projects.length + " " + header.textContent
}