let useremail = document.getElementById("email");
let userpassword = document.getElementById("password");
let alertlogin = document.getElementById("alertlogin");

function login() {
  let email = useremail.value;
  let password = userpassword.value;
  let users = JSON.parse(localStorage.getItem("data"));

  alertlogin.classList.remove("d-none");

  if (users == null) {
    alertlogin.innerHTML = "No registered users found.";
    return;
  }

  let found = false;

  for (let i = 0; i < users.length; i++) {
    if ( email === users[i].email && password === users[i].password) {
      found = true;
      localStorage.setItem("useremail", users[i].email);
      localStorage.setItem("username", users[i].name);
      alertlogin.innerHTML = "Login successful!";
      window.location.href = "chat.html";
      return;
    }
  }

  if (!found) {
    alertlogin.innerHTML = "Invalid email or password.";
  }
}
