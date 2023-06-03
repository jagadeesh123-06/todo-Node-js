const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const format = require("date-fns/format");
const isMatch = require("date-fns/isMatch");
const isValid = require("date-fns/isValid");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

//Initializing

initializeDbServerIntoResponse = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3004, () => {
      console.log("Server started at http://localhost/3000/");
    });
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};
initializeDbServerIntoResponse();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    category: dbObject.category,
    priority: dbObject.priority,
    status: dbObject.status,
    dueDate: dbObject.due_date,
  };
};

const datefns = (dbDatefns) => {
  const year = dbDatefns.year;
  const month = dbDatefns.month;
  const day = dbDatefns.day;
  const reqDatefns = format(new Date(year, month + 1, day));
  return reqDatefns;
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const hasSearchProperty = (requestQuery) => {
  return requestQuery.search_q !== undefined;
};

const hasCategoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};

const hasDueDateProperty = (requestQuery) => {
  return requestQuery.dueDate !== undefined;
};

const hasPriorityAndStatusProperty = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasCategoryAndPriorityProperty = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};

const hasCategoryAndStatusProperty = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};

//API 1

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status, category } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperty(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          getTodosQuery = `
                    SELECT
                        *
                    FROM
                        todo
                    WHERE
                        todo LIKE '%${search_q}%'
                        AND status = '${status}'
                        AND priority = '${priority}';
                    `;
          data = await db.all(getTodosQuery);
          response.send(
            data.map((each) => convertDbObjectToResponseObject(each))
          );
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    case hasPriorityProperty(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        getTodosQuery = `
                SELECT 
                    *
                FROM
                    todo
                WHERE
                    todo LIKE '%${search_q}%'
                    AND priority = '${priority}';
                `;
        data = await db.all(getTodosQuery);
        response.send(
          data.map((each) => convertDbObjectToResponseObject(each))
        );
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    case hasStatusProperty(request.query):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        getTodosQuery = `
                SELECT 
                    *
                FROM
                    todo
                WHERE
                    todo LIKE '%${search_q}%'
                    AND status = '${status}';
                `;
        data = await db.all(getTodosQuery);
        response.send(
          data.map((each) => convertDbObjectToResponseObject(each))
        );
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }

      break;

    case hasCategoryProperty(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category == "LEARNING"
      ) {
        getTodosQuery = `
            SELECT 
                *
            FROM 
                todo
            WHERE
                category = '${category}';
            `;
        data = await db.all(getTodosQuery);
        response.send(
          data.map((each) => convertDbObjectToResponseObject(each))
        );
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    case hasSearchProperty(request.query):
      getTodosQuery = `
            SELECT 
                *
            FROM 
                todo
            WHERE
                todo LIKE '%${search_q}%'
            `;
      data = await db.all(getTodosQuery);
      response.send(data.map((each) => convertDbObjectToResponseObject(each)));
      break;

    case hasCategoryAndPriorityProperty(request.body):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          priority === "HIGH" ||
          priority === "MEDIUM" ||
          priority === "LOW"
        ) {
          getTodosQuery = `
                    SELECT 
                        * 
                    FROM 
                        todo 
                    WHERE 
                        AND category = '${category}'
                        AND priority = '${priority}'
                    `;
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      } else {
        response.status(400);
        response.send("Invali Todo Category");
      }
      data = await db.all(getTodosQuery);
      response.send(data.map((each) => convertDbObjectToResponseObject(each)));

      break;

    case hasCategoryAndStatusProperty(request.body):
      if (
        (category === "WORK" || category === "HOME", category === "LEARNING")
      ) {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          getTodosQuery = `
                    SELECT 
                        * 
                    FROM 
                        todo 
                    WHERE 
                        todo LIKE '%${search_q}%'
                        AND category = '${category}'
                        AND status = '${status}'
                    `;
          data = await db.all(getTodosQuery);
          response.send(map((each) => convertDbObjectToResponseObject(each)));
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    default:
      getTodosQuery = `
                SELECT
                    *
                FROM 
                    todo
                `;
      data = await db.all(getTodosQuery);
      response.send(data.map((each) => convertDbObjectToResponseObject(each)));
  }
});

//API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `SELECT * FROM todo WHERE id = '${todoId}'`;
  const responseResult = await db.get(getTodoQuery);
  response.send(convertDbObjectToResponseObject(responseResult));
});

//API 3

app.get("/agenda/", async (request, response) => {
  const { date } = request.body;
  console.log(isMatch(date, "yyyy-MM-dd"));
  if (isMatch(date, "yyyy-MM-dd")) {
    const newDate = format(new Date(date), "yyyy-MM-dd");
    console.log(newDate);
    const requestQuery = `SELECT * FROM todo WHERE due_date = '${newDate}'`;
    const responseResult = await db.all(requestQuery);
    response.send(
      responseResult.map((each) => convertDbObjectToResponseObject(each))
    );
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

//API 4

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      if (
        (category === "WORK" || category === "HOME", category === "LEARNING")
      ) {
        if (isMatch(dueDate, "yyyy-MM-dd")) {
          const postNewDueDate = format(new Date(dueDate), "yyyy-MM-dd");
          const postTodoQuery = `INSERT INTO todo (id, todo, priority, status, category, dueDate) VALUES (${id}, '${todo}', '${priority}', '${status}', '${category}', '${postNewDueDate}')`;
          await db.run(postTodoQuery);
          response.send("Todo Successfully Added");
        } else {
          response.send(400);
          response.status("Invalid Due Date");
        }
      } else {
        response.send(400);
        response.status("Invalid Todo Category");
      }
    } else {
      response.send(400);
      response.status("Invalid Todo Status");
    }
  } else {
    response.send(400);
    response.status("Invalid Todo Priority");
  }
});

//API 5

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const requestBody = request.body;
  console.log(requestBody);
  const previousTodoQuery = `SELECT * FROM todo WHERE id = ${todoId}`;
  const previousTodo = await db.get(previousTodoQuery);
  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
    category = previousTodo.category,
    dueDate = previousTodo.dueDate,
  } = request.body;
  let updateTodoQuery;
  switch (true) {
    case requestBody.status !== undefined:
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        updateTodoQuery = `
                UPDATE
                    todo
                    SET 
                        todo = '${todo}', priority = '${priority}', status = '${status}', category = '${category}', due_date = '${dueDate}'
                    WHERE
                        id = ${todoId}
                `;
        await db.run(updateTodoQuery);
        response.send("Status Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;

    case requestBody.priority !== undefined:
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        updateTodoQuery = `
                UPDATE
                    todo
                    SET 
                        todo = '${todo}', priority = '${priority}', status = '${status}', category = '${category}', due_date = '${dueDate}'
                    WHERE
                        id = ${todoId}
                `;
        await db.run(updateTodoQuery);
        response.send("Priority Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    case requestBody.todo !== undefined:
      updateTodoQuery = `
                UPDATE
                    todo
                    SET 
                        todo = '${todo}', priority = '${priority}', status = '${status}', category = '${category}', dueDate = '${dueDate}'
                    WHERE
                        id = ${todoId}
                `;
      await db.run(updateTodoQuery);
      response.send("Todo Updated");
      break;

    case requestBody.priority !== undefined:
      if (
        (category === "WORK" || category === "HOME", category === "LEARNING")
      ) {
        updateTodoQuery = `
                UPDATE
                    todo
                    SET 
                        todo = '${todo}', priority = '${priority}', status = '${status}', category = '${category}', dueDate = '${dueDate}'
                    WHERE
                        id = ${todoId}
                `;
        await db.run(updateTodoQuery);
        response.send("Category Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    case requestBody.dueDate !== undefined:
      if (isMatch(dueDate, "yyyy-MM-dd")) {
        const newDueDate = format(new Date(dueDate), "yyyy-MM-dd");
        updateTodoQuery = `
            UPDATE
                    todo
                    SET 
                        todo = '${todo}', priority = '${priority}', status = '${status}', category = '${category}', due_date = '${newDueDate}'
                    WHERE
                        id = ${todoId}
            `;
        await db.run(updateTodoQuery);
        response.send("Due Date Updated");
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
      break;
  }
});

//API 6
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `
    DELETE FROM 
        todo
    WHERE   
        id = ${todoId}
    `;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
