const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const result = users.find(user => user.username === username);

  if (!result) {
    return response.status(404).json({error: "User doesnt exists!"});
  }

  request.user = result;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some(user => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({error: "User already exists!"});
  }

  const createdUser = {
    id: uuidv4(),
    name, 
    username,
    todos: []
  }
  
  users.push(createdUser);

  return response.status(201).json(createdUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  return response.status(201).json(request.user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const createdTodo = {
    id: uuidv4(),
	  title,
	  done: false, 
	  deadline: new Date(deadline), 
	  created_at: new Date()
  }

  request.user.todos.push(createdTodo);

  //const todo = request.user.todos.push .......... return.....json(todo)

  return response.status(201).json(createdTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id }  = request.params;
  const { user } = request;

  const idExists = user.todos.some(todo => todo.id === id);

  const userIndex = user.todos.findIndex(todo => todo.id === id);

  if (!idExists) {
    return response.status(404).json({error: "ToDo doesnt exists!"});
  }

  user.todos[userIndex].title = title;
  user.todos[userIndex].deadline = deadline;
  
  return response.status(201).send(user.todos[userIndex]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id }  = request.params;

  const idExists = user.todos.some(todo => todo.id === id);

  const userIndex = user.todos.findIndex(todo => todo.id === id);

  console.log(user.todos[userIndex]);

  if (!idExists) {
    return response.status(404).json({error: "ToDo doesnt exists!"});
  }

  user.todos[userIndex].done = true;

  return response.status(201).send(user.todos[userIndex]);
});


app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id }  = request.params;

  const idExists = user.todos.some(todo => todo.id === id);

  const userIndex = user.todos.findIndex(todo => todo.id === id);

  if (!idExists) {
    return response.status(404).json({error: "ToDo doesnt exists!"});
  }

  user.todos.splice(userIndex, 1);

  return response.status(204).send();
});

module.exports = app;