
document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('menu');

    menuToggle.addEventListener('click', () => {
        menu.classList.toggle('hidden');
    });

    // Countdown functionality
    const generateButton = document.getElementById('generate-btn');
    const countdownDisplay = document.getElementById('countdown');
    let countdown;

    generateButton.addEventListener('click', function () {
        let timeLeft = 20;
        countdownDisplay.textContent = `Time left: ${timeLeft}s`;

        // Disable the button while counting down
        generateButton.disabled = true;

        countdown = setInterval(function () {
            timeLeft--;
            countdownDisplay.textContent = `Time left: ${timeLeft}s`;

            if (timeLeft <= 0) {
                clearInterval(countdown); // Stop the countdown
                countdownDisplay.textContent = 'Time is up!';
                generateButton.disabled = false; // Re-enable the button
            }
        }, 1000);

        // Run the function to initiate the image generation process
        generateAndFetchImage();
    });

    // Image generation and polling functionality
    function generateAndFetchImage() {
        let promptText = document.querySelector("#prompt-input").value; // Get the value when the button is clicked

        // Step 1: POST request to generate the task ID
        fetch("https://api.zahid.cat/v1/text2img/generate", {
            method: 'POST',
            headers: {
                'x-api-key': 'zxapi', // Use your API key here
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "prompt": promptText,
                "negative_prompt": "blurry, low quality",
                "img_count": 1
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.result.task_id) {
                console.log("Task ID:", data.result.task_id);
                // Step 2: Poll for the result
                pollForResult(data.result.task_id);
            } else {
                console.error("Failed to generate task ID:", data);
            }
        })
        .catch(error => console.error('Error in POST request:', error));
    }

    // Function to poll the GET request for the result
    function pollForResult(taskId) {
        const interval = setInterval(() => {
            fetch(`https://api.zahid.cat/v1/text2img/result?task_id=${taskId}&api-key=zxapi`, {
                method: 'GET',
                headers: {
                    'accept': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    if (data.result.tasks && data.result.tasks.length > 0) {
                        const images = data.result.tasks[0].images;
                        if (images && images.high) {
                            // Set the image URL to the img src
                            document.querySelector("#generated-image").src = images.high;
                            clearInterval(interval); // Stop polling once the result is available
                        } else {
                            console.log("Image generation is in progress...");
                        }
                    } else {
                        console.log("Task is still processing...");
                    }
                } else {
                    console.log("Task failed or not yet complete:", data);
                }
            })
            .catch(error => {
                console.error('Error in GET request:', error);
                clearInterval(interval); // Stop polling on error
            });
        }, 5000); // Poll every 5 seconds
    }
});

