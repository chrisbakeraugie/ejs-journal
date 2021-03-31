window.onload = function () {
  let dateFld = this.document.getElementById('client-date-input');
  dateFld.value = new this.Date();
  dateFld.readOnly = true;
};