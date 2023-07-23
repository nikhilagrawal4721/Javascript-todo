document.addEventListener("DOMContentLoaded", function () {
  let todoList = [
    { taskDetails: "do homework", id: 1 },
    { taskDetails: "sleep", id: 2 }
  ];

  const taskInput = document.getElementById("taskInput");
  const addButton = document.getElementById("addButton");
  const taskList = document.getElementById("taskList");

  function renderTodoList() {
    taskList.innerHTML = ""; // Clear the current list
    todoList.forEach((task) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span>${task.taskDetails}</span>
        <button class="delete-button" data-id="${task.id}">Delete</button>
      `;
      taskList.appendChild(li);
    });
  }

  function addTaskToArray(taskDetails) {
    const newTask = {
      taskDetails: taskDetails,
      id: todoList.length + 1
    };
    todoList.push(newTask);
  }

  function removeTaskFromArray(taskId) {
    todoList = todoList.filter((task) => task.id !== taskId);
  }

  addButton.addEventListener("click", function () {
    const taskText = taskInput.value.trim();
    if (taskText !== "") {
      addTaskToArray(taskText);
      taskInput.value = "";
      renderTodoList();
    }
  });

  taskList.addEventListener("click", function (event) {
    if (event.target.classList.contains("delete-button")) {
      const taskId = parseInt(event.target.getAttribute("data-id"));
      removeTaskFromArray(taskId);
      renderTodoList();
    }
  });

  // Initial render of the todo list
  renderTodoList();
});