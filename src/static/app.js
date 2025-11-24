document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Cria a lista de participantes
        let participantsHTML = "";
        if (details.participants.length > 0) {
          participantsHTML = `
            <div class="participants-section">
              <strong>Participantes:</strong>
              <ul class="participants-list">
                ${details.participants.map(email => `<li>${email}</li>`).join("")}
              </ul>
            </div>
          `;
        } else {
          participantsHTML = `
            <div class="participants-section">
              <strong>Participantes:</strong>
              <span class="no-participants">Nenhum participante ainda.</span>
            </div>
          `;
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsHTML}
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();

  // BMI Calculator functionality
  const bmiForm = document.getElementById("bmi-form");
  const bmiResultDiv = document.getElementById("bmi-result");

  bmiForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const weight = parseFloat(document.getElementById("weight").value);
    const height = parseFloat(document.getElementById("height").value);

    try {
      const response = await fetch("/calculate-bmi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ weight, height }),
      });

      const result = await response.json();

      if (response.ok) {
        bmiResultDiv.innerHTML = `
          <div class="bmi-result-content">
            <h4>Resultado do IMC</h4>
            <p class="bmi-value">IMC: <strong>${result.bmi}</strong></p>
            <p class="bmi-classification">Classificação: <strong>${result.classification}</strong></p>
            <p class="bmi-category">Categoria: <strong>${result.category}</strong></p>
          </div>
        `;
        bmiResultDiv.className = "bmi-success";
      } else {
        bmiResultDiv.innerHTML = `<p class="error">${result.detail || "Erro ao calcular IMC"}</p>`;
        bmiResultDiv.className = "error";
      }

      bmiResultDiv.classList.remove("hidden");

      // Hide result after 5 seconds
      setTimeout(() => {
        bmiResultDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      bmiResultDiv.innerHTML = `<p class="error">Falha ao calcular IMC. Tente novamente.</p>`;
      bmiResultDiv.className = "error";
      bmiResultDiv.classList.remove("hidden");
      console.error("Error calculating BMI:", error);
    }
  });
});
