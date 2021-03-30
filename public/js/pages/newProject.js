window.onload = function () {
  let projects = JSON.parse(this.document.getElementById('projects').value);
  let submit = this.document.getElementById('submit');
  let warning = this.document.getElementById('warning');
  let title = this.document.getElementById('title');

  if (title.value === '') {
    title.addEventListener('keyup', projectTitleCheck);
  }

  function projectTitleCheck() {
    warning.hidden = true;
    submit.disabled = false;
    projects.forEach(project => {
      if (project.title.toLowerCase() === title.value.toLowerCase()) {
        submit.disabled = true;
        warning.hidden = false;
      }
    });
  }
};