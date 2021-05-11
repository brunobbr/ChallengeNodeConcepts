const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;
  const user = users.find(user => user.username === username);
  if (user) {
    request.user = user
    return next()
  } else {
    return response.json({ error: "User not found" })
  }
}

//created user
app.post('/users', (request, response) => {
  const {name, username} = request.body;
  const userExists = users.find(user => user.username === username);

  if(userExists){
    return response.status(400).json({error: "UserName already exists!"})
  }

  const newUser = { 
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(newUser);
  return response.status(201).json(newUser);
});

//search to-do of user
app.get('/todos', checksExistsUserAccount, (request, response) => {
    const {user} = request;
    const todos = user.todos;

    return response.status(200).json(todos)
});

//create new to-do
app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {title, deadline} = request.body;

  const todo = { 
    id: uuidv4(),
    title: title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }
  user.todos.push(todo);
  return response.status(201).json(todo);
});

//update  a to-do
app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;
  const {title: newTitle, deadline: newDeadline} = request.body;

  const oldTodo = user.todos.find(todo => todo.id === id);
  
  if (oldTodo) {
    oldTodo.id = id
    oldTodo.title = newTitle
    oldTodo.deadline = newDeadline
    oldTodo.updated_at = new Date()

    return response.status(200).json(oldTodo)
  } else {
    return response.status(404).json({ error: "No to-do were found with this ID!" })
  }
});

// END  a to-do
app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;
  const todo = user.todos.find(todo => todo.id === id);

  if(!todo) {
    return response.status(404).json({error: "Todo not found!!"});
  }

  todo.done = true;

  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;
  const todoIndex = user.todos.findIndex(todo => todo.id === id);

  if(!todoIndex === -1) {
    return response.status(404).json({error: "Todo not found!!"});
  }

  user.todos.splice(todoIndex, 1);

  return response.status(204).send()
});

module.exports = app;