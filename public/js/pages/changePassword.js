window.onload = function () {
  let form = this.document.getElementById('changePasswordForm');
  let newPassword = this.document.getElementById('newPassword');
  let newPasswordConfirm = this.document.getElementById('newPasswordConfirm');
  let changePassSubmit = this.document.getElementById('changePassSubmit');
  let matchPassWarn = this.document.getElementById('matchPassWarn');

  if(form){
    this.document.addEventListener('keyup', passwordCheck);
  }

  function passwordCheck() {
    if (newPassword.value !== newPasswordConfirm.value) {
      changePassSubmit.disabled = true;
      matchPassWarn.hidden = false;
    } else {
      changePassSubmit.disabled = false;
      matchPassWarn.hidden = true;
    }
  }  
};