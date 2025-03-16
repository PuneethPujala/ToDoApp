// Show/Hide Timer Inputs Based on Selection
function toggleTimerInput() {
    let timerType = $("#timerType").val();
    if (timerType === "real-time") {
        $("#realTimeSection").show();
        $("#countdownSection").hide();
    } else {
        $("#realTimeSection").hide();
        $("#countdownSection").show();
    }
}

// Add Task Function
function addTask() {
    let taskName = $("#taskName").val().trim();
    let taskDetails = $("#taskDetails").val().trim();
    let timerType = $("#timerType").val();
    let taskCategory = $("#taskCategory").val();
    let taskPriority = $("#taskPriority").val();
    let taskCreatedTime = new Date().toLocaleString();

    if (taskName === "") {
        alert("Task Name cannot be empty!");
        return;
    }

    let taskId = new Date().getTime();
    let timerDisplay = "";
    let dueTime = "No Reminder Set";
    let reminderTimestamp = null; 

    // Handle Reminder Settings
    if (timerType === "real-time") {
        let reminderTime = $("#reminderTime").val();
        if (reminderTime) {
            let reminderDate = new Date(reminderTime);
            dueTime = reminderDate.toLocaleString();
            timerDisplay = `<span class="task-timer">⏰ ${dueTime}</span>`;
            reminderTimestamp = reminderDate.getTime(); 
        }
    } else {
        let countdownValue = parseInt($("#countdownValue").val());
        let countdownUnit = $("#countdownUnit").val();

        if (!isNaN(countdownValue) && countdownValue > 0) {
            let countdownTime = calculateFutureTime(countdownValue, countdownUnit);
            dueTime = countdownTime.toLocaleString();
            timerDisplay = `<span class="task-timer">⏳ ${dueTime}</span>`;
            reminderTimestamp = countdownTime.getTime(); 
            startCountdown(taskId, countdownTime);
        }
    }

    // Task HTML Structure
    let taskHtml = `
        <li class="list-group-item task-item d-flex justify-content-between align-items-center" 
            data-id="${taskId}" data-reminder="${reminderTimestamp}" data-category="${taskCategory}" data-priority="${taskPriority}">
            <div class="task-info">
                <input type="checkbox" class="task-checkbox" onchange="toggleTaskCompletion(this)">
                <span class="task-name">${taskName}</span> 
                <span class="task-category badge bg-info">${taskCategory}</span> 
                <span class="task-priority badge bg-warning">${taskPriority}</span>
                ${timerDisplay}
                <p class="task-details">${taskDetails}</p>
                <p class="task-created">🕒 Created: ${taskCreatedTime}</p>
            </div>
            <button class="btn btn-light btn-sm delete-btn" onclick="removeTask(this)">❌</button>
        </li>
    `;

    $("#taskList").append(taskHtml);
    saveTasks();
    
    // Clear Inputs
    $("#taskName, #taskDetails, #reminderTime, #countdownValue").val("");
}

// Function to Calculate Future Time for Countdown
function calculateFutureTime(value, unit) {
    let now = new Date();
    switch (unit) {
        case "seconds": now.setSeconds(now.getSeconds() + value); break;
        case "minutes": now.setMinutes(now.getMinutes() + value); break;
        case "hours": now.setHours(now.getHours() + value); break;
        case "days": now.setDate(now.getDate() + value); break;
    }
    return now;
}

// Countdown Timer Function
function startCountdown(taskId, endTime) {
    let interval = setInterval(() => {
        let now = new Date().getTime();
        let distance = endTime.getTime() - now;
        if (distance <= 0) {
            clearInterval(interval);
            alert("Task Reminder Time Reached!");
        }
    }, 1000);
}

// Remove Task
function removeTask(element) {
    $(element).closest("li").remove();
    saveTasks();
}

// Toggle Task Completion
function toggleTaskCompletion(element) {
    let taskItem = $(element).closest("li");
    taskItem.toggleClass("completed");
    if (taskItem.hasClass("completed")) {
        $("#completedTasks").append(taskItem);
    } else {
        $("#taskList").append(taskItem);
    }
    saveTasks();
}

// Save Tasks to Local Storage
function saveTasks() {
    let tasks = [];
    $(".task-item").each(function () {
        let reminderTimestamp = $(this).attr("data-reminder");

        let task = {
            id: $(this).data("id"),
            name: $(this).find(".task-name").text(),
            details: $(this).find(".task-details").text(),
            created: $(this).find(".task-created").text(),
            category: $(this).data("category"),
            priority: $(this).data("priority"),
            reminder: reminderTimestamp ? parseInt(reminderTimestamp) : null 
        };
        tasks.push(task);
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Load Tasks from Local Storage
function loadTasks() {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    $("#taskList, #completedTasks").empty();

    tasks.forEach(task => {
        let timerDisplay = task.reminder 
            ? `<span class="task-timer">⏰ ${new Date(task.reminder).toLocaleString()}</span>`
            : "";

        let taskHtml = `
            <li class="list-group-item task-item d-flex justify-content-between align-items-center" 
                data-id="${task.id}" data-reminder="${task.reminder || ''}" data-category="${task.category}" data-priority="${task.priority}">
                <div class="task-info">
                    <input type="checkbox" class="task-checkbox" onchange="toggleTaskCompletion(this)">
                    <span class="task-name">${task.name}</span> 
                    <span class="task-category badge bg-info">${task.category}</span> 
                    <span class="task-priority badge bg-warning">${task.priority}</span>
                    ${timerDisplay}
                    <p class="task-details">${task.details}</p>
                    <p class="task-created">${task.created}</p>
                </div>
                <button class="btn btn-light btn-sm delete-btn" onclick="removeTask(this)">❌</button>
            </li>
        `;

        if (task.completed) {
            $("#completedTasks").append(taskHtml);
        } else {
            $("#taskList").append(taskHtml);
        }
    });
}

// Check Reminders and Trigger Notifications
function checkReminders() {
    let now = new Date().getTime();
    $(".task-item").each(function () {
        let reminderTimestamp = $(this).attr("data-reminder");

        if (reminderTimestamp && parseInt(reminderTimestamp) <= now) {
            let taskName = $(this).find(".task-name").text();
            let taskDetails = $(this).find(".task-details").text();

            alert(`Reminder: ${taskName}\n${taskDetails}`);

            // Remove reminder attribute and update storage to prevent duplicate alerts
            $(this).removeAttr("data-reminder");
            saveTasks();
        }
    });
}

// Run reminder check every second
setInterval(checkReminders, 1000);

// Load tasks when the page loads
$(document).ready(function () {
    loadTasks();
    setInterval(checkReminders, 1000);
});
