const todoForm = document.getElementById("todoForm");
const taskInput = document.getElementById("taskInput");
const categoryInput = document.getElementById("categoryInput");
const tagsInput = document.getElementById("tagsInput");
const dueDateInput = document.getElementById("dueDateInput");
const prioritySelect = document.getElementById("prioritySelect");
const listContainer = document.getElementById("list-container");
const dueDateFilter = document.getElementById("dueDateFilter");
const categoryFilter = document.getElementById("categoryFilter");
const priorityFilter = document.getElementById("priorityFilter");
const backlogsContainer = document.getElementById("backlogs-container");
const activityLogsContainer = document.getElementById(
  "activity-logs-container"
);

let todoList = [];
let activityLogs = [];

function renderList() {
  listContainer.innerHTML = "";
  backlogsContainer.innerHTML = "";

  const now = new Date().toISOString().split("T")[0];

  const filteredList = todoList.filter((item) => {
    const dueDateFilterValue = dueDateFilter.value;
    const categoryFilterValue = categoryFilter.value;
    const priorityFilterValue = priorityFilter.value;

    return (
      (!dueDateFilterValue || item.dueDate === dueDateFilterValue) &&
      (!categoryFilterValue || item.category === categoryFilterValue) &&
      (!priorityFilterValue || item.priority === priorityFilterValue)
    );
  });

  filteredList.forEach((item) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `
        <label>
          <input type="checkbox" ${item.completed ? "checked" : ""}>
          <span class="${item.completed ? "done" : ""}">${item.title}</span>
        </label>
        <span class="category">${
          item.category ? `Category: ${item.category}` : ""
        }</span>
        <span class="due-date">${
          item.dueDate ? `Due: ${item.dueDate}` : ""
        }</span>
        <span class="reminder">${
          item.reminder ? `Reminder: ${item.reminder}` : ""
        }</span> <!-- Display the reminder -->

        <span class="priority">Priority: ${item.priority}</span>
        <span class="tags">${
          item.tags ? `Tags: ${item.tags.join(", ")}` : ""
        }</span>
        <button class="edit-btn">Edit</button>
        <button class="add-subtask-btn">Add Subtask</button>
      `;

    const checkbox = listItem.querySelector('input[type="checkbox"]');
    checkbox.addEventListener("change", () => {
      item.completed = checkbox.checked;
      renderList();
    });

    const editButton = listItem.querySelector(".edit-btn");
    editButton.addEventListener("click", () => {
      const newTitle = prompt("Enter the new title:", item.title);
      if (newTitle !== null && newTitle.trim() !== "") {
        editItem(item.id, newTitle.trim());
      }
    });

    const addSubtaskButton = listItem.querySelector(".add-subtask-btn");
    addSubtaskButton.addEventListener("click", () => {
      const subtaskTitle = prompt("Enter the subtask title:");
      if (subtaskTitle !== null && subtaskTitle.trim() !== "") {
        addSubtask(item.id, subtaskTitle.trim());
      }
    });

    const deleteButton = document.createElement("button");
    deleteButton.innerText = "Delete";
    deleteButton.classList.add("delete-btn");
    deleteButton.addEventListener("click", () => {
      removeItem(item.id);
    });

    listItem.appendChild(deleteButton);

    if (item.completed || (item.dueDate && item.dueDate < now)) {
      backlogsContainer.appendChild(listItem);
    } else {
      listContainer.appendChild(listItem);
    }

    // Check if the item has subtasks
    if (item.subtasks && item.subtasks.length > 0) {
      const subtasksList = document.createElement("ul");
      subtasksList.classList.add("subtasks");
      item.subtasks.forEach((subtask) => {
        const subtaskItem = document.createElement("li");
        subtaskItem.innerHTML = `
            <label>
              <input type="checkbox" ${subtask.completed ? "checked" : ""}>
              <span class="${subtask.completed ? "done" : ""}">${
          subtask.title
        }</span>
            </label>
            <button class="edit-btn">Edit</button>
          `;

        const subtaskCheckbox = subtaskItem.querySelector(
          'input[type="checkbox"]'
        );
        subtaskCheckbox.addEventListener("change", () => {
          subtask.completed = subtaskCheckbox.checked;
          renderList();
        });

        const subtaskEditButton = subtaskItem.querySelector(".edit-btn");
        subtaskEditButton.addEventListener("click", () => {
          const newSubtaskTitle = prompt("Enter the new title:", subtask.title);
          if (newSubtaskTitle !== null && newSubtaskTitle.trim() !== "") {
            editSubtask(item.id, subtask.id, newSubtaskTitle.trim());
          }
        });

        subtasksList.appendChild(subtaskItem);
      });

      listItem.appendChild(subtasksList);
    }
  });
   // Add drag and drop support for tasks
  const taskListItems = listContainer.querySelectorAll('li:not(.subtask)');
  taskListItems.forEach((item) => {
    item.draggable = true;

    item.addEventListener('dragstart', (event) => {
      event.dataTransfer.setData('text/plain', item.id);
    });
  });

  // Add drag and drop support for subtasks
  const subtaskListItems = listContainer.querySelectorAll('.subtasks li');
  subtaskListItems.forEach((subtaskItem) => {
    subtaskItem.draggable = true;

    subtaskItem.addEventListener('dragstart', (event) => {
      event.dataTransfer.setData('text/plain', subtaskItem.id);
    });
  });

  // Add drag and drop support for rearranging tasks and subtasks
  listContainer.addEventListener('dragover', (event) => {
    event.preventDefault();
    const draggedItemId = event.dataTransfer.getData('text/plain');
    const draggedItem = document.getElementById(draggedItemId);
    const closestItem = getClosestItem(event.clientY, taskListItems);

    if (closestItem) {
      const isSubtask = draggedItem.classList.contains('subtask');
      const isSameLevel = closestItem.classList.contains('subtasks') === isSubtask;

      if (isSameLevel) {
        const container = isSubtask ? closestItem : listContainer;
        container.insertBefore(draggedItem, closestItem);
      }
    }
  });
}

function getClosestItem(yPosition, items) {
  return [...items].reduce((closest, item) => {
    const box = item.getBoundingClientRect();
    const offset = yPosition - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset, element: item };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;

}

function renderBacklogs() {
  backlogsContainer.innerHTML = "";

  const now = new Date().toISOString().split("T")[0];

  const backlogs = todoList.filter((item) => {
    return item.completed === false && item.dueDate && item.dueDate < now;
  });

  if (backlogs.length === 0) {
    const message = document.createElement("p");
    message.textContent = "No tasks in the backlog";
    backlogsContainer.appendChild(message);
  } else {
    backlogs.forEach((item) => {
      const listItem = document.createElement("li");
      listItem.innerHTML = `
        <label>
          <input type="checkbox" ${item.completed ? "checked" : ""}>
          <span class="${item.completed ? "done" : ""}">${item.title}</span>
        </label>
        <span class="category">${
          item.category ? `Category: ${item.category}` : ""
        }</span>
        <span class="due-date">${
          item.dueDate ? `Due: ${item.dueDate}` : ""
        }</span>
        <span class="priority">Priority: ${item.priority}</span>
        <span class="tags">${
          item.tags ? `Tags: ${item.tags.join(", ")}` : ""
        }</span>
        <button class="edit-btn">Edit</button>
        <button class="add-subtask-btn">Add Subtask</button>
      `;

      const checkbox = listItem.querySelector('input[type="checkbox"]');
      checkbox.addEventListener("change", () => {
        item.completed = checkbox.checked;
        renderList();
        renderBacklogs(); // Update backlogs after marking as completed
      });

      const editButton = listItem.querySelector(".edit-btn");
      editButton.addEventListener("click", () => {
        const newTitle = prompt("Enter the new title:", item.title);
        if (newTitle !== null && newTitle.trim() !== "") {
          editItem(item.id, newTitle.trim());
        }
      });

      const addSubtaskButton = listItem.querySelector(".add-subtask-btn");
      addSubtaskButton.addEventListener("click", () => {
        const subtaskTitle = prompt("Enter the subtask title:");
        if (subtaskTitle !== null && subtaskTitle.trim() !== "") {
          addSubtask(item.id, subtaskTitle.trim());
        }
      });

      const deleteButton = document.createElement("button");
      deleteButton.innerText = "Delete";
      deleteButton.classList.add("delete-btn");
      deleteButton.addEventListener("click", () => {
        removeItem(item.id);
      });

      listItem.appendChild(deleteButton);
      backlogsContainer.appendChild(listItem);
    });
  }
}
function sortByDueDate() {
  todoList.sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });
  renderList();
}

function sortByPriority() {
  todoList.sort((a, b) => {
    const priorityValues = { low: 1, medium: 2, high: 3 };
    return priorityValues[a.priority] - priorityValues[b.priority];
  });
  renderList();
}

// Add event listener for sorting
const sortSelect = document.getElementById("sortSelect");
sortSelect.addEventListener("change", () => {
  const sortBy = sortSelect.value;
  if (sortBy === "dueDate") {
    sortByDueDate();
  } else if (sortBy === "priority") {
    sortByPriority();
  }
});

function addItem(title, category, tags, dueDate, priority, reminder) {
  const newItem = {
    id: Date.now(),
    title: title,
    category: category,
    tags: tags.split(",").map((tag) => tag.trim()),
    priority: priority,
    completed: false,
    dueDate: dueDate,
    subtasks: [],
    reminder: reminder,
  };
  todoList.push(newItem);
  renderList();
  logActivity("Task added", newItem);
  saveTodoListToLocalStorage();
}

function editItem(id, newTitle) {
  todoList = todoList.map((item) => {
    if (item.id === id) {
      const oldTitle = item.title;
      item.title = newTitle;
      renderList();
      logActivity(
        `Task title changed from "${oldTitle}" to "${newTitle}"`,
        item
      );
      saveTodoListToLocalStorage();
    }
    return item;
  });
}

function addSubtask(parentId, subtaskTitle) {
  todoList = todoList.map((item) => {
    if (item.id === parentId) {
      if (!item.subtasks) {
        item.subtasks = [];
      }
      const newSubtask = {
        id: Date.now(),
        title: subtaskTitle,
        completed: false,
      };
      item.subtasks.push(newSubtask);
      renderList();
      logActivity("Subtask added", newSubtask);
      saveTodoListToLocalStorage();
    }
    return item;
  });
}

function editSubtask(parentId, subtaskId, newTitle) {
  todoList = todoList.map((item) => {
    if (item.id === parentId && item.subtasks) {
      item.subtasks = item.subtasks.map((subtask) => {
        if (subtask.id === subtaskId) {
          const oldTitle = subtask.title;
          subtask.title = newTitle;
          renderList();
          logActivity(
            `Subtask title changed from "${oldTitle}" to "${newTitle}"`,
            item
          );
          saveTodoListToLocalStorage();
        }
        return subtask;
      });
    }
    return item;
  });
}

function removeItem(id) {
  const removedItem = todoList.find((item) => item.id === id);
  if (removedItem) {
    todoList = todoList.filter((item) => item.id !== id);
    renderList();
    logActivity("Task removed", removedItem);
    saveTodoListToLocalStorage();
  }
}

function logActivity(action, item) {
  const timestamp = new Date().toISOString();
  activityLogs.push({ timestamp, action, item });
  renderActivityLogs();
}

function renderActivityLogs() {
  activityLogsContainer.innerHTML = "";
  activityLogs.forEach((log) => {
    const logItem = document.createElement("li");
    logItem.textContent = `[${log.timestamp}] ${log.action}: ${log.item.title}`;
    activityLogsContainer.appendChild(logItem);
  });
}

todoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = taskInput.value.trim();
  const category = categoryInput.value.trim();
  const tags = tagsInput.value.trim();
  const dueDate = dueDateInput.value;
  const priority = prioritySelect.value;

  if (title !== "") {
    addItem(title, category, tags, dueDate, priority);
    taskInput.value = "";
    categoryInput.value = "";
    tagsInput.value = "";
    dueDateInput.value = "";
  }
});
function getTodoListFromLocalStorage() {
  console.log("get is working");
  const storedTodoList = localStorage.getItem("todoList");
  return storedTodoList ? JSON.parse(storedTodoList) : [];
}

// Add event listeners for filters
dueDateFilter.addEventListener("change", renderList);
categoryFilter.addEventListener("input", renderList);
priorityFilter.addEventListener("change", renderList);

function saveTodoListToLocalStorage() {
  try {
    // Ensure the todoList is updated with the latest changes before saving
    console.log("Saving todo list to local storage...");
    localStorage.setItem("todoList", JSON.stringify(todoList));
    console.log("Todo list saved successfully!");
  } catch (error) {
    console.error("Error while saving todo list to local storage:", error);
  }
}

//Below code is for the implementing the search functionalities.

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");

function searchExactTodo(searchTerm) {
  const exactMatch = todoList.filter(
    (item) => item.title.toLowerCase() === searchTerm.toLowerCase()
  );
  renderSearchResults(exactMatch);
}

function searchSubtasks(searchTerm) {
  const matchingTasks = todoList.filter((item) => {
    return item.subtasks.some((subtask) =>
      subtask.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  renderSearchResults(matchingTasks);
}

function searchSimilarWords(searchTerm) {
  const similarWords = todoList.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  renderSearchResults(similarWords);
}

function searchPartial(searchTerm) {
  const partialMatches = todoList.filter((item) => {
    return (
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subtasks.some((subtask) =>
        subtask.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  });
  renderSearchResults(partialMatches);
}

function searchByTags(searchTerm) {
  const matchingTags = todoList.filter((item) => {
    return item.tags.some(
      (tag) => tag.toLowerCase() === searchTerm.toLowerCase()
    );
  });
  renderSearchResults(matchingTags);
}

function renderSearchResults(results) {
  listContainer.innerHTML = "";

  results.forEach((item) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `
        <label>
          <input type="checkbox" ${item.completed ? "checked" : ""}>
          <span class="${item.completed ? "done" : ""}">${item.title}</span>
        </label>
        <span class="category">${
          item.category ? `Category: ${item.category}` : ""
        }</span>
        <span class="due-date">${
          item.dueDate ? `Due: ${item.dueDate}` : ""
        }</span>
        <span class="priority">Priority: ${item.priority}</span>
        <span class="tags">${
          item.tags ? `Tags: ${item.tags.join(", ")}` : ""
        }</span>
        <button class="edit-btn">Edit</button>
        <button class="add-subtask-btn">Add Subtask</button>
      `;

    // ... Existing code for event listeners ...

    listContainer.appendChild(listItem);
  });
}

searchButton.addEventListener("click", () => {
  const searchTerm = searchInput.value.trim();
  if (searchTerm !== "") {
    let searchType = document.querySelector('input[name="searchType"]:checked');
    searchType = searchType ? searchType.value : "exactTodo"; // Use default search type

    if (searchType === "exactTodo") {
      searchExactTodo(searchTerm);
    } else if (searchType === "subtasks") {
      searchSubtasks(searchTerm);
    } else if (searchType === "similarWords") {
      searchSimilarWords(searchTerm);
    } else if (searchType === "partial") {
      searchPartial(searchTerm);
    } else if (searchType === "tags") {
      searchByTags(searchTerm);
    }
  }
});

function extractDateFromInput(inputText) {
  // Regular expression to match date formats: tomorrow, 13th Jan 2023 3 pm, etc.
  const datePattern =
    /(\btomorrow\b)|((\d{1,2}(st|nd|rd|th)? (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4})( \d{1,2}:\d{1,2} (am|pm))?)|((\d{1,2}(st|nd|rd|th)? (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4}))/i;
  const dateMatch = inputText.match(datePattern);
  return dateMatch ? dateMatch[0] : null;
}

function createDueDateFromText(todoText) {
  const extractedDate = extractDateFromInput(todoText);
  if (extractedDate) {
    const currentDate = new Date();
    let dueDate = new Date(currentDate);

    if (extractedDate.toLowerCase() === 'tomorrow') {
      dueDate.setDate(currentDate.getDate() + 1);
    } else {
      dueDate = new Date(extractedDate);
    }

    return dueDate.toISOString().split('T')[0];
  }
  return null;
}

function handleSave() {
  console.log("this method is calling");
  const inputBox = document.getElementById("taskInput");
  const taskDetails = inputBox.value;

  if (taskDetails !== "") {
    const dueDate = createDueDateFromText(taskDetails);
    const newTask = {
      title: taskDetails,
      id: todoList.length + 1,
      completed: false,
      dueDate: dueDate,
      reminder: reminder,
    };
    todoList.push(newTask);
    inputBox.value = "";
    renderList();
    saveTodoListToLocalStorage();
  }
}

// Initial rendering
renderList();
renderBacklogs();
// On page load, retrieve the todo list from local storage and render it
document.addEventListener("DOMContentLoaded", () => {
  console.log("this  local storage method is working");
  todoList = getTodoListFromLocalStorage();
  renderList();
  renderBacklogs();
});
