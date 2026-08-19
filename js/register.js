let username = document.getElementById("name");
let useremail = document.getElementById("email");
let userpassword = document.getElementById("password");
let userconfirmpassword=document.getElementById("confirmpassword")
let usernumber = document.getElementById("number");
let userage = document.getElementById("age");
let usergender = document.getElementById("gender");
let alertname = document.getElementById("alertname");
let alertemail = document.getElementById("alertemail");
let alertpassword = document.getElementById("alertpassword");
let alertconfirmpassword = document.getElementById("alertconfirmpassword");
let alertnumber = document.getElementById("alertnumber");
let alertgender = document.getElementById("alertgender");
let users;

//////check if the data in the local storage or not ////////

if (localStorage.getItem("data") != null) {
  users = JSON.parse(localStorage.getItem("data"));
} else {
  users = [];
}

////////register function////////
function register() {
  let isNameValid = validatename();
  let isEmailValid = validateemail();
  let isPasswordValid = validatepassword();
  let isconfirmed = validateconfirmpassword();
  let isNumberValid=validatenumber();
  let isGenderValid=validategender();
  if (isNameValid && isEmailValid && isPasswordValid && isconfirmed && isNumberValid && isGenderValid ) {
    let user = {
      name: username.value,
      email: useremail.value,
      password: userpassword.value,
      number:usernumber.value,
      age:userage.value,
      gender:usergender.value,
    };
    users.push(user);
    localStorage.setItem("data", JSON.stringify(users));
    clearform();
    window.location.href = "login.html";
  } else {
    alert("All Data Must Be Correct");
  }
}

//////clear data after submit//////
function clearform() {
  username.value = "";
  useremail.value = "";
  userpassword.value = "";
  userage.value="";
  usernumber.value="";
  userconfirmpassword.value="";
  usergender.selectedIndex = 0;
}

///////valdition name/////

function validatename() {
  let nameregx = /^[A-Z][a-z]{3,8}$/;
  if (nameregx.test(username.value) == true) {
    username.classList.add("is-valid");
    username.classList.remove("is-invalid");
    alertname.classList.add("d-none");
    alertname.classList.remove("d-block");
    return true;
  } else {
    username.classList.add("is-invalid");
    username.classList.remove("is-valid");
    alertname.classList.add("d-block");
    alertname.classList.remove("d-none");
    return false;
  }
}
username.addEventListener("blur", validatename);

/////validation email//////
function validateemail() {
  let emailregx = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (emailregx.test(useremail.value) == true) {
    useremail.classList.add("is-valid");
    useremail.classList.remove("is-invalid");
    alertemail.classList.add("d-none");
    alertemail.classList.remove("d-block");
    return true;
  } else {
    useremail.classList.add("is-invalid");
    useremail.classList.remove("is-valid");
    alertemail.classList.add("d-block");
    alertemail.classList.remove("d-none");
    return false;
  }
}
useremail.addEventListener("blur", validateemail);

//////validation password//////
function validatepassword() {
  let passwordregx =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (passwordregx.test(userpassword.value) == true) {
    userpassword.classList.add("is-valid");
    userpassword.classList.remove("is-invalid");
    alertpassword.classList.add("d-none");
    alertpassword.classList.remove("d-block");
    return true;
  } else {
    userpassword.classList.add("is-invalid");
    userpassword.classList.remove("is-valid");
    alertpassword.classList.add("d-block");
    alertpassword.classList.remove("d-none");
    return false;
  }
}
userpassword.addEventListener("blur", validatepassword);

//////validation confirm password//////
function validateconfirmpassword() {
  if (userconfirmpassword.value === userpassword.value && userconfirmpassword.value !== "") {
    userconfirmpassword.classList.add("is-valid");
    userconfirmpassword.classList.remove("is-invalid");
    alertconfirmpassword.classList.add("d-none");
    alertconfirmpassword.classList.remove("d-block");
    return true;
  } else {
    userconfirmpassword.classList.add("is-invalid");
    userconfirmpassword.classList.remove("is-valid");
    alertconfirmpassword.classList.add("d-block");
    alertconfirmpassword.classList.remove("d-none");
    return false;
  }
}
userconfirmpassword.addEventListener("blur", validateconfirmpassword);

//////////////////////validation phone///////////////

function validatenumber(){
let numberregx =/^01[0125][0-9]{8}$/;
 if (numberregx.test(usernumber.value) == true)
 {
    usernumber.classList.add("is-valid");
    usernumber.classList.remove("is-invalid");
    alertnumber.classList.add("d-none");
    alertnumber.classList.remove("d-block");
    return true;
 }
 else{
    usernumber.classList.add("is-invalid");
    usernumber.classList.remove("is-valid");
    alertnumber.classList.add("d-block");
    alertnumber.classList.remove("d-none"); 
    return false;
 }
}
usernumber.addEventListener("blur", validatenumber);

/////////////////validate gender///////////

function validategender() {
  if (usergender.value !== "") {
    alertgender.classList.add("d-none");
    alertgender.classList.remove("d-block");
    return true;
  } else {
    alertgender.classList.add("d-block");
    alertgender.classList.remove("d-none"); 
    return false;
  }
}
usergender.addEventListener("blur", validategender);
