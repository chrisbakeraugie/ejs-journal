window.onload = function () {
  let form = this.document.getElementById('tempKeyForm');
  let newPassword = this.document.getElementById('newPassword');
  let newPasswordConfirm = this.document.getElementById('newPasswordConfirm');
  let matchPassWarn = this.document.getElementById('matchPassWarn');
  let resetPassSubmit = this.document.getElementById('resetPassSubmit');

  if (form) {
    this.document.addEventListener('keyup', passwordCheck);
  }

  function passwordCheck() {
    if (newPassword.value !== newPasswordConfirm.value) {
      resetPassSubmit.disabled = true;
      matchPassWarn.hidden = false;
    } else {
      resetPassSubmit.disabled = false;
      matchPassWarn.hidden = true;
    }
  }
};