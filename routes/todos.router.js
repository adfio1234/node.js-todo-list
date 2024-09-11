// /routes/todos.router.js

import express from 'express';
import Todo from "../schemas/todo.schemas.js";
import joi from "joi";
const router = express.Router();
//유효성 검사
const createdTodoSchema = joi.object({
  value: joi.string().min(1).max(50).required(),
});
// routes/todos.router.js

//데이터 베이스 사용시 async 데이터 베이스 조회시간동안 프로그램이 멈출 수도 있음.
router.post("/todos", async (req, res, next) => {
  // 클라이언트에게 전달받은 value 데이터를 변수에 저장합니다.
  //const { value } = req.body;
  try {
    const validation = await createdTodoSchema.validateAsync(req.body);

    const { value } = validation;
    //만약, 클라이언트가 value데이터를 전달하지 않았을 떄, 클라이언트에게 에러메세지 전달.
    if (!value) {
      return res
        .status(400)
        .json({ erroMessage: "해야할 일{value} 데이터가 존재 하지않습니다." });
    }

    // Todo모델을 사용해, MongoDB에서 'order' 값이 가장 높은 '해야할 일'을 찾습니다.
    const todoMaxOrder = await Todo.findOne().sort("-order").exec();
    //findOne()한개의 값만 찾는다. -를붙여서 order를 내림차순으로 정렬
    //데이터 조회시 exec()붙이기

    // 'order' 값이 가장 높은 도큐멘트의 1을 추가하거나 없다면, 1을 할당합니다.
    const order = todoMaxOrder ? todoMaxOrder.order + 1 : 1;

    // Todo모델을 이용해, 새로운 '해야할 일'을 생성합니다.
    const todo = new Todo({ value, order });

    // 생성한 '해야할 일'을 MongoDB에 저장합니다.
    await todo.save();

    return res.status(201).json({ todo });
  } catch (error) {
    next(error);
  }
});
// routes/todos.router.js

/**해야할 일 목록 조회api **/
router.get("/todos", async (req, res) => {
  // Todo모델을 이용해, MongoDB에서 'order' 값이 가장 높은 '해야할 일'을 찾습니다.
  const todos = await Todo.find().sort("-order").exec();

  // 찾은 '해야할 일'을 클라이언트에게 전달합니다.
  return res.status(200).json({ todos });
});

//**해야할 일 순서 변경 & 완료,해제&변경**/

router.patch("/todos/:todoId", async (req, res) => {
  // 변경할 '해야할 일'의 ID 값을 가져옵니다.(:todoId)
  const { todoId } = req.params;
  // '해야할 일'을 몇번째 순서로 설정할 지 order 값을 가져옵니다. done으로 완료 상태 가져옴
  const { order, done, value } = req.body;

  // 변경하려는 '해야할 일'을 가져옵니다. 만약, 해당 ID값을 가진 '해야할 일'이 없다면 에러를 발생시킵니다.
  const currentTodo = await Todo.findById(todoId).exec();
  if (!currentTodo) {
    return res
      .status(404)
      .json({ errorMessage: "존재하지 않는 todo 데이터입니다." });
  }

  if (order) {
    // 변경하려는 order 값을 가지고 있는 '해야할 일'을 찾습니다.
    const targetTodo = await Todo.findOne({ order }).exec();
    if (targetTodo) {
      // 만약, 이미 해당 order 값을 가진 '해야할 일'이 있다면, 해당 '해야할 일'의 order 값을 변경하고 저장합니다.
      targetTodo.order = currentTodo.order;
      await targetTodo.save();
    }
    // 변경하려는 '해야할 일'의 order 값을 변경합니니다.
    currentTodo.order = order;
  }
  if (done !== undefined) {
    currentTodo.doneAt = done ? new Date() : null;
  }

  if (value) {
    currentTodo.value = value;
  }
  // 변경된 '해야할 일'을 저장합니다.
  await currentTodo.save();

  return res.status(200).json({});
});

/** 할 일 삭제Api **/
router.delete("/todos/:todoId", async (req, res) => {
  // 삭제할 '해야할 일'의 ID 값을 가져옵니다.
  const { todoId } = req.params;

  // 삭제하려는 '해야할 일'을 가져옵니다. 만약, 해당 ID값을 가진 '해야할 일'이 없다면 에러를 발생시킵니다.
  const todo = await Todo.findById(todoId).exec();
  if (!todo) {
    return res
      .status(404)
      .json({ errorMessage: "존재하지 않는 todo 데이터입니다." });
  }

  // 조회된 '해야할 일'을 삭제합니다. _id는 기본적으로 todoId에 해당한다.
  await Todo.deleteOne({ _id: todoId }).exec();

  return res.status(200).json({});
});

export default router;
