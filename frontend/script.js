const apiBaseUrl = "http://localhost:3000";

// Handle login
document.getElementById("login-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const response = await fetch(`${apiBaseUrl}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();
  if (response.ok) {
    alert(data.message);
    window.location.href = "dashboard.html";
  } else {
    alert(data.message);
  }
});

// Handle signup
document.getElementById("signup-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const response = await fetch(`${apiBaseUrl}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();
  if (response.ok) {
    alert(data.message);
    window.location.href = "login.html";
  } else {
    alert(data.message);
  }
});

// Handle fact-checking
document.getElementById("fact-check-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const statement = document.getElementById("statement").value;

  const response = await fetch(`${apiBaseUrl}/fact-check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ statement }),
  });

  const data = await response.json();
  if (response.ok) {
    document.getElementById("result-container").style.display = "block";
    document.getElementById("result").innerText = data.result;
  } else {
    alert("Error: " + data.message);
  }
});

// Handle logout
document.getElementById("logout-btn")?.addEventListener("click", () => {
  alert("Logged out");
  window.location.href = "index.html";
});
