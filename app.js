import express from "express";
import connect from "./schemas/index.js";
import todosRouter from "./routes/todos.router.js";
import errorHandlerMiddleware from "./middlewares/error-handler.middleware.js";

const app = express();
const PORT = 3000;

connect();
// Express에서 req.body에 접근하여 body 데이터를 사용할 수 있도록 설정합니다.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//app.use는 미들웨어를 사용하게 해주는 코드이다. /api가 붙은 경우 json미들웨어를 거친뒤, router로 연결되도록 하는것이다.
app.use(express.static("./assets"));
//단순히 정적인 파일을 우리가 assets폴더에 파일들 바탕으로 서빙을 할거다.
//미리준비한 파일을 서빙한다.(경로 입력안해도 index.html을 찾게돼있다.)

//next()다음 미들웨어 실행

const router = express.Router();

router.get("/", (req, res) => {
  return res.json({ message: "Hi!" });
});

app.use("/api", [router, todosRouter]);

//에러처리 미들웨어 등록
//왜 router 하단에 등록 하는가 라우터에서 에러발생시 옮길수 있음.
app.use(errorHandlerMiddleware);

app.listen(PORT, () => {
  console.log(PORT, "포트로 서버가 열렸어요!");
});
