window.onload = function () {
  let form = this.document.getElementById('delete-project-form');
  let deleteButton = this.document.getElementById('deleteProject');
  let projectTitle = this.document.getElementById('project-title-to-delete').value;
  let idToDelete = this.document.getElementById('project-id-to-delete').value;
  let projectToDelete = this.document.getElementById('projectToDelete');

  if (form) {
    form.addEventListener('keyup', titleCheck);
  }

  if (deleteButton) {
    deleteButton.onclick = () => {
      return confirm(`Are you sure you want to delete "${projectTitle}"? This cannot be reversed!`);
    };
  }

  function titleCheck() {
    if (projectTitle !== projectToDelete.value) {
      deleteButton.href = '#';
      deleteButton.color = 'blue';
      form.matchProjectTitle.hidden = false;
    } else {
      form.matchProjectTitle.hidden = true;
      deleteButton.href = idToDelete;
      deleteButton.color = 'red';
    }
  }


};