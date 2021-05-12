const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

//Middleware
function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find(user => user.username === username)

  if (user) {
    request.user = user
    return next()
  } else {
    return response.json({ error: "User not found" })
  }
}

//Create Users
app.post('/users', (request, response) => {
  const { name, username } = request.body

  const sameUser = users.find(user => user.username === username)

  if (sameUser) {
    return response.status(400).json({ error: "The username already exists!" })
  }

  const newUser = {
    name: name,
    username: username,
    id: uuidv4(),
    todos: []
  }

  users.push(newUser)

  return response.status(201).json(newUser)
});

//search to-do of user
app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const todos = user.todos

  return response.status(200).json(todos)
});

//create new toDo
app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body

  const todo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo)

  return response.status(201).json(todo)
});

//update to-do
app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params
  const { title: newTitle, deadline: newDeadline } = request.body

  const oldTodo = user.todos.find(todo => todo.id === id)

  if (oldTodo) {
    oldTodo.id = id
    oldTodo.title = newTitle
    oldTodo.deadline = newDeadline
    oldTodo.updated_at = new Date()

    return response.status(200).json(oldTodo)
  } else {
    return response.status(404).json({ error: "No to-do weres found with this ID!" })
  }
});

//End to-do
app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const todo = user.todos.find(todo => todo.id === id)

  if (todo) {
    todo.done = true

    return response.status(200).json(todo)

  } else {
    return response.status(404).json({ error: "To-do not found!" })
  }
});


app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const todoIndex = user.todos.findIndex(todo => todo.id === id)

  if (todoIndex === -1) {

    return response.status(404).json({ error: "Error! task ID not found!" })

  }
    user.todos.splice(todoIndex, 1)
    
    return response.status(204).json()
});

module.exports = app;