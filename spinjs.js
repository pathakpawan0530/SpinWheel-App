const wheel = document.getElementById("wheel");
const spinBtn = document.getElementById("spin-btn");
const finalValue = document.getElementById("final-value");
const setValInput = document.getElementById("set-Val");
const setValueBtn = document.getElementById("setValueBtn");

// Object that stores values of minimum and maximum angle for a value
const rotationValues = [
  { minDegree: 0, maxDegree: 35, value: 1 },
  { minDegree: 36, maxDegree: 71, value: 2 },
  { minDegree: 72, maxDegree: 107, value: 3 },
  { minDegree: 108, maxDegree: 143, value: 4 },
  { minDegree: 144, maxDegree: 179, value: 5 },
  { minDegree: 180, maxDegree: 215, value: 6 },
  { minDegree: 216, maxDegree: 251, value: 7 },
  { minDegree: 252, maxDegree: 287, value: 8 },
  { minDegree: 288, maxDegree: 323, value: 9 },
  { minDegree: 324, maxDegree: 359, value: 10 },
];

// Size of each piece
const data = [16, 16, 16, 16, 16, 16, 16, 16, 16, 16];

// Default background color for each piece
let pieColors = [
  "#8b35bc", "#b163da", "#8b35bc", "#b163da", "#8b35bc", "#b163da",
  "#8b35bc", "#b163da", "#8b35bc", "#b163da"
];

// Function to update the color of the selected value box
const updateWheelColor = (value) => {
  // Reset all colors to the default
  pieColors = [
    "#8b35bc", "#b163da", "#8b35bc", "#b163da", "#8b35bc", "#b163da",
    "#8b35bc", "#b163da", "#8b35bc", "#b163da"
  ];

  if (value) {
    // Get the index for the saved value (1-10) and set that index to green
    const valueIndex = parseInt(value, 10) - 1; // Map 1-10 to index 0-9
    pieColors[valueIndex] = "#28a745"; // Change to green
  }
};

// Create chart
let myChart = new Chart(wheel, {
  plugins: [ChartDataLabels],
  type: "pie",
  data: {
    labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    datasets: [
      {
        backgroundColor: pieColors,
        data: data,
      },
    ],
  },
  options: {
    responsive: true,
    animation: { duration: 0 },
    plugins: {
      tooltip: false,
      legend: { display: false },
      datalabels: {
        color: "#ffffff",
        formatter: (_, context) => context.chart.data.labels[context.dataIndex],
        font: { size: 24 },
      },
    },
  },
});

// Display value based on the random angle
const valueGenerator = (angleValue) => {
  for (let i of rotationValues) {
    if (angleValue >= i.minDegree && angleValue <= i.maxDegree) {
      finalValue.innerHTML = `<p>Last spinned Value is: ${i.value}</p>`;
      spinBtn.disabled = false;

      // Update the wheel color based on the spun value
      updateWheelColor(i.value);

      // Re-render the chart with the updated colors
      myChart.data.datasets[0].backgroundColor = pieColors;
      myChart.update();

      break;
    }
  }
};

// Spinner count
let count = 0;
let resultValue = 101;


const runTimmer = () => {
  spinBtn.disabled = true;
  finalValue.innerHTML = `<p>Good Luck!</p>`;

  // Retrieve saved value from localStorage
  let randomDegree;
  const savedValue = localStorage.getItem("spinValue");

  if (savedValue) {
    // If a value is set in localStorage, use it
    resultValue = parseInt(savedValue, 10);

    // Calculate the exact center of the degree range for the value
    const minDegree = (resultValue - 1) * 36; // Start of the segment
    const maxDegree = resultValue * 36 - 1; // End of the segment
    randomDegree = Math.floor((minDegree + maxDegree) / 2); // Exact center of the range
  } else {
    // If no value is set, generate a random value (using Math.random)
    randomDegree = Math.floor(Math.random() * 360);
  }

  // Add multiple full rotations to ensure animation plays properly
  const targetRotation = 360 * 15 + randomDegree; // 15 full rotations + target value

  let currentRotation = 0; // Track the current rotation
  let spinSpeed = 25; // Initial spin speed, you can start with a higher speed
  let slowingDown = false; // Flag to indicate when to slow down

  const rotationInterval = window.setInterval(() => {
    if (!slowingDown) {
      // If we haven't started slowing down, keep rotating at a steady speed
      currentRotation += spinSpeed;
    } else {
      // Once we start slowing down, gradually reduce the speed
      currentRotation += spinSpeed;
      spinSpeed *= 0.98; // Gradually reduce speed by 2% at each step
      if (spinSpeed < 1) {
        spinSpeed = 1; // Prevent the speed from going too low (we stop at speed 1)
      }
    }

    // Start slowing down once we are within 3 full rotations (1080 degrees) of the target
    if (currentRotation >= targetRotation - 1080) {
      slowingDown = true;
    }

    // Stop the spin when the target rotation is reached
    if (currentRotation >= targetRotation) {
      clearInterval(rotationInterval); // Stop the interval
      const finalRotation = currentRotation % 360; // Normalize to 0-359
      valueGenerator(finalRotation); // Determine the final value
      count = 0; // Reset count
      resultValue = 101; // Reset result value

      // Start the timer after a 1.5-second delay
      setTimeout(() => {
        startTimer();
      }, 2500);
    }

    myChart.options.rotation = currentRotation % 360; // Update chart rotation
    myChart.update(); // Re-render the chart
  }, 10); // Interval for smooth animation
};




// Timer function
function startTimer() {
  let timeLeft = 10;

  const timerDisplay = document.getElementById("timer-display");

  function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes < 10 ? "0" : ""}${minutes} m : ${seconds < 10 ? "0" : ""}${seconds} s ⏱️`;
  }

  // Reset pieColors to default colors when the timer restarts
  pieColors = [
    "#8b35bc", "#b163da", "#8b35bc", "#b163da", "#8b35bc", "#b163da",
    "#8b35bc", "#b163da", "#8b35bc", "#b163da"
  ];

  // Re-render the chart with the default colors
  myChart.data.datasets[0].backgroundColor = pieColors;
  myChart.update();

  const intervalId = setInterval(function () {
    if (timeLeft <= 0) {
      clearInterval(intervalId);
      timerDisplay.textContent = "Time's up!";
      runTimmer();
    } else {
      timeLeft--;
      updateDisplay();
    }
  }, 1000);

  updateDisplay(); // Initialize display
}

// Initialize the timer on page load
startTimer();

// Set the value from the input field and store it in localStorage
setValueBtn.addEventListener("click", () => {
  const value = parseInt(setValInput.value, 10);
  if (isNaN(value) || value < 1 || value > 10) {
    alert("Please enter a value between 1 and 10");
    Swal.fire({
      icon: "error",
      text: "Please enter a value between 1 and 10.",
    });
  } else {
    localStorage.setItem("spinValue", value);
    setValInput.value = "";
    Swal.fire({
      text: `Value ${value} has been saved!,This will reflect in next spin.`,
      icon: "success"
    });


    // Update the wheel color based on the selected value
    // updateWheelColor(value);

    // Re-render the chart with the updated colors
    myChart.data.datasets[0].backgroundColor = pieColors;
    myChart.update();
  }
});

// Update wheel color on page load if a value is set in localStorage
const savedValue = localStorage.getItem("spinValue");
updateWheelColor(savedValue);


const DltSpinVal  = document.getElementById("DltSpinVal");

DltSpinVal.addEventListener('click',()=>{
  var spinSetVal = localStorage.getItem("spinValue");
if(!spinSetVal){
  Swal.fire({
    icon: "error",
    text: "The spin value is not set, so there's nothing to delete.",
  });
}else{
  localStorage.clear("spinValue");
  Swal.fire({
    text: "The spin value has been successfully removed.",
    icon: "success"
  });
}
})


