window.onload = function () {
  let dateFld = this.document.getElementById('client-date-input');
  dateFld.value = new this.Date();
  dateFld.readOnly = true;

  let deleteButtons = this.document.getElementsByClassName('delete-entry');
  if (deleteButtons.length > 0) {
    for (let i = 0; i < deleteButtons.length; i++) {
      deleteButtons[i].onclick = () => {
        return confirm('Are you sure you want to delete this entry? This cannot be reversed!');
      };
    }
  }
};