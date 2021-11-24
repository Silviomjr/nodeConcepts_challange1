const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.json());

const users = [];

function checkExistsUserAccount(request, response, next) {
  const { username } = request.headers;

    const user = users.find(user => user.username === username);

    if(!user) return response.status(404).json({error: 'User not found!'});

    request.user = user;

    return next();
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;
  
  const userAlreadyExists = users.some((user) => user.username === username);

  if(userAlreadyExists) return response.status(400).json({error: "User already exists!"});
  
  let newUser = {
    id: uuidv4(),
      name,
      username,
      todos: []
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get('/todos', checkExistsUserAccount, (request, response) => {
  const { todos } = request.user;

  return response.status(201).json(todos);
});

app.post('/todos', checkExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const user = request.user;

  const todo = {
    title,
    deadline: new Date(deadline),
    created_at: new Date(),
    id: uuidv4(),
    done: false
  }
  user.todos.push(todo)

  return response.status(201).json(todo);

});

app.put('/todos/:id', checkExistsUserAccount, (request, response) => {
  //id da tarefa a ser alterada;
  const { id } = request.params;
  const { title, deadline } = request.body;
  user = request.user;
  const checkUser = user.todos.find(todo => todo.id === id);
  if(!checkUser) {return response.status(404).json({error: "To do not found"})}
  
  user.todos.forEach((todo, index) => {
    if(todo.id === id) {
      user.todos[index].title = title;
      user.todos[index].deadline = new Date(deadline);
    };
  });

  returning = user.todos.filter(todo => todo.id === id)[0]
  
  return response.status(201).json({deadline: returning.deadline, done: returning.done, title:returning.title});
});

app.patch('/todos/:id/done', checkExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const user = request.user;

  const checkUser = user.todos.find(todo => todo.id === id);
  if(!checkUser) {return response.status(404).json({error: "To do not found"})}

  user.todos.forEach((todo, index) => {
    if(todo.id === id) {
      user.todos[index].done = true;
    };
  });
  
  return response.status(201).json(user.todos.filter(todo => todo.id === id)[0]);
});

app.delete('/todos/:id', checkExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const user = request.user;

  const checkUser = user.todos.find(todo => todo.id === id);
  if(!checkUser) {return response.status(404).json({error: "To do not found"})}

  user.todos.forEach((todo, index) => {
    todo.id === id ? user.todos.splice(index, 1): '';
  });

  return response.status(204).json(user);

});

module.exports = app;