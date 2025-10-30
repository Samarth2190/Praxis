document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const exerciseOptions = document.querySelectorAll('.exercise-option');
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');
    const setsInput = document.getElementById('sets');
    const repsInput = document.getElementById('reps');
    const currentExercise = document.getElementById('current-exercise');
    const currentSet = document.getElementById('current-set');
    const currentReps = document.getElementById('current-reps');
    
    // Variables
    let selectedExercise = null;
    let workoutRunning = false;
    let statusCheckInterval = null;
    
    // Select exercise
    exerciseOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove selected class from all options
            exerciseOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Add selected class to clicked option
            this.classList.add('selected');
            selectedExercise = this.getAttribute('data-exercise');
        });
    });
    
    // Start workout
    startBtn.addEventListener('click', function() {
        if (!selectedExercise) {
            alert('Please select an exercise first!');
            return;
        }
        
        const sets = parseInt(setsInput.value);
        const reps = parseInt(repsInput.value);
        
        if (isNaN(sets) || sets < 1 || isNaN(reps) || reps < 1) {
            alert('Please enter valid numbers for sets and repetitions.');
            return;
        }
        
        // Start the exercise via API
        fetch('/start_exercise', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                exercise_type: selectedExercise,
                sets: sets,
                reps: reps
            }),
        })
        .then(async response => {
            const contentType = response.headers.get('content-type');
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            
            // Try to parse error message from response even if status is not OK
            if (!response.ok) {
                if (contentType && contentType.includes('application/json')) {
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.error || errorMessage;
                    } catch (e) {
                        // If JSON parsing fails, use the default error message
                    }
                }
                throw new Error(errorMessage);
            }
            
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Expected JSON response but got ' + contentType);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                workoutRunning = true;
                startBtn.disabled = true;
                stopBtn.disabled = false;
                
                // Update UI
                currentExercise.textContent = selectedExercise.replace('_', ' ').toUpperCase().replace('.EXE', '');
                currentSet.textContent = `1 / ${sets}`;
                currentReps.textContent = `0 / ${reps}`;
                
                // Start status polling
                statusCheckInterval = setInterval(checkStatus, 1000);
            } else {
                const errorMsg = data.error || 'Unknown error';
                console.error('Exercise start failed:', errorMsg);
                alert('Failed to start exercise: ' + errorMsg);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error: ' + (error.message || 'An error occurred while starting the exercise.'));
        });
    });
    
    // Stop workout
    stopBtn.addEventListener('click', function() {
        fetch('/stop_exercise', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Expected JSON response but got ' + contentType);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                resetWorkoutUI();
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
    
    // Function to check status
    function checkStatus() {
        fetch('/get_status')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Expected JSON response but got ' + contentType);
            }
            return response.json();
        })
        .then(data => {
            if (!data.exercise_running && workoutRunning) {
                // Workout has ended
                resetWorkoutUI();
                return;
            }
            
            // Update status display
            currentSet.textContent = `${data.current_set} / ${data.total_sets}`;
            currentReps.textContent = `${data.current_reps} / ${data.rep_goal}`;
        })
        .catch(error => {
            console.error('Error checking status:', error);
            // Silently fail for status checks to avoid spam
        });
    }
    
    // Reset UI after workout ends
    function resetWorkoutUI() {
        workoutRunning = false;
        startBtn.disabled = false;
        stopBtn.disabled = true;
        
        if (statusCheckInterval) {
            clearInterval(statusCheckInterval);
            statusCheckInterval = null;
        }
        
        currentExercise.textContent = 'STANDBY';
        currentSet.textContent = '0 / 0';
        currentReps.textContent = '0 / 0';
    }
});
