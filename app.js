const express = require("express");

const { open } = require("sqlite");

const sqlite3 = require("sqlite3");

const path = require("path");

const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: databasePath,

      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);

    process.exit(1);
  }
};

initializeDbAndServer();

////1.GET all TODO movies
const getAllTodosMethod = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const getTodoHighPriorityMethod = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const highAndInProgressMethod = (requestQuery) => {
  return (
    requestQuery.status !== undefined && requestQuery.priority !== undefined
  );
};

const searchMethod = (requestQuery) => {
  return requestQuery.search_q !== undefined;
};
app.get("/todos/", async (request, response) => {
  const { search_q = " ", priority, status } = request.query;
  switch (true) {
    case getAllTodosMethod(request.query):
      const getAllTodos = `
             SELECT
               *
             FROM
               todo
             WHERE
               status = '${status}';`;
      const res = await db.all(getAllTodos);
      response.send(res);
      break;
    case getTodoHighPriorityMethod(request.query):
      const getPriorQuery = `
        SELECT
          * 
        FROM
          todo
        WHERE  
          priority = '${priority}';`;
      const priorityR = await db.all(getPriorQuery);
      response.send(priorityR);
      break;
    case highAndInProgressMethod(request.query):
      const highAndInQuery = `
          SELECT 
           *
          FROM
            todo
          WHERE 
            priority = '${priority}' AND status = '${status}';`;
      const highAndInR = await db.all(highAndInQuery);
      response.send(highAndInR);
      break;
    case searchMethod(request.query):
      const searchQuery = `
          SELECT *
          FROM
            todo
          WHERE
            todo LIKE '%${search_q}%';`;
      const searchR = await db.all(searchQuery);
      response.send(searchR);
      break;
  }
});

////2.GET todo based on todo id
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
      SELECT
        *
      FROM
        todo
      WHERE
        id = '${todoId}';`;
  const getTodoR = await db.get(getTodoQuery);
  response.send(getTodoR);
});

////3.POST todo in table
app.post("/todos/", async (request, response) => {
  const { id, todo, status, priority } = request.body;
  const postTodoQuery = `
     INSERT INTO 
       todo(id,todo,status,priority)
     VALUES (
         '${id}',
         '${todo}',
         '${status}',
         '${priority}'
         );`;
  const postTodoR = await db.run(postTodoQuery);
  response.send("Todo Successfully Added");
});

const statusMethod = (bodyRequest) => {
  return bodyRequest.status !== undefined;
};

const priorityMethod = (bodyRequest) => {
  return bodyRequest.priority !== undefined;
};

const todoMethod = (bodyRequest) => {
  return bodyRequest.todo !== undefined;
};
////5.PUT todo based on Todo Id
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo } = request.body;
  switch (true) {
    case statusMethod(request.body):
      const statusQuery = `
          UPDATE 
            todo
          SET
            status = '${status}';
          WHERE
            id = '${todoId}';`;
      await db.run(statusQuery);
      response.send("Status Updated");
      break;

    case priorityMethod(request.body):
      const priorityQuery = `
          UPDATE
            todo
          SET
            priority = '${priority}'
          WHERE 
            id = '${todoId}';`;
      await db.run(priorityQuery);
      response.send("Priority Updated");
      break;

    case todoMethod(request.body):
      const todoQuery = `
          UPDATE
            todo
          SET
            todo = '${todo}'
          WHERE
            id = '${todoId}';`;
      await db.run(todoQuery);
      response.send("Todo Updated");
      break;
  }
});

////5.DELETE Todo based on todo Id
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `
   DELETE FROM todo 
   WHERE id = '${todoId}';`;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
