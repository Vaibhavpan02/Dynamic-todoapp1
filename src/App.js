import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

const debounce = (func, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
};

const App = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [editText, setEditText] = useState('');

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://dynamic-todoapp.onrender.com/todos');
      setTodos(response.data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) {
      return; // if the input is empty or whitespace, do nothing
    }
    const id = Date.now().toString();
    const newTodoItem = { id, text: newTodo };

    setTodos((prevTodos) => [...prevTodos, newTodoItem]);
    setNewTodo('');

    try {
      await axios.post('https://dynamic-todoapp.onrender.com/todos', newTodoItem);
    } catch (error) {
      console.error('Error adding todo:', error);
      // Rollback if error occurs
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
    }
  };

  const deleteTodo = async (id) => {
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));

    try {
      await axios.delete(`https://dynamic-todoapp.onrender.com/todos/${id}`);
    } catch (error) {
      console.error('Error deleting todo:', error);
      fetchTodos();
    }
  };

  const startEditing = (todo) => {
    setEditingTodo(todo);
    setEditText(todo.text);
  };

  const updateTodo = async (e) => {
    e.preventDefault();
    if (!editText.trim()) {
      return; // if the input is empty or whitespace, do nothing
    }

    const updatedTodoItem = { id: editingTodo.id, text: editText };

    setTodos((prevTodos) =>
      prevTodos.map((todo) => (todo.id === editingTodo.id ? updatedTodoItem : todo))
    );
    setEditingTodo(null);
    setEditText('');

    try {
      await axios.put(`https://dynamic-todoapp.onrender.com/todos/${editingTodo.id}`, updatedTodoItem);
    } catch (error) {
      console.error('Error updating todo:', error);
      fetchTodos(); // Re-fetch todos in case of error
    }
  };

  const cancelEdit = () => {
    setEditingTodo(null);
    setEditText('');
  };

  return (
    <div className="App">
      <h1>Todo List</h1>
      <form onSubmit={addTodo}>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
        />
        <button type="submit" disabled={loading}>Add Todo</button>
      </form>

      {loading ? <p>Loading...</p> : (
        <ul>
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onDelete={() => deleteTodo(todo.id)}
              onEdit={() => startEditing(todo)}
              isEditing={editingTodo?.id === todo.id}
              editText={editText}
              setEditText={setEditText}
              updateTodo={updateTodo}
              cancelEdit={cancelEdit}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

const TodoItem = React.memo(({ todo, onDelete, onEdit, isEditing, editText, setEditText, updateTodo, cancelEdit }) => (
  <li>
    {isEditing ? (
      <>
        <form onSubmit={updateTodo} className="edit-form">
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />
          <div className="edit-buttons">
            <button type="submit" className="update-button">Update Todo</button>
            <button type="button" className="cancel-button" onClick={cancelEdit}>Cancel</button>
          </div>
        </form>
      </>
    ) : (
      <>
        {todo.text}
        <div className="todo-buttons">
          <button className="edit-button" onClick={onEdit}>Edit</button>
          <button className="delete-button" onClick={onDelete}>Delete</button>
        </div>
      </>
    )}
  </li>
));

export default App;
