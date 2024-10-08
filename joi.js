import Joi from "joi";

// Joi 스키마를 정의합니다.
const schema = Joi.object({
  // name Key는 문자열 타입이고, 필수로 존재해야합니다.
  // 문자열은 최소 3글자, 최대 30글자로 정의합니다.
  name: Joi.string().min(3).max(30).required(),
  //email: Joi.string().email().required(), 이메일 검증
});

// 검증할 데이터를 정의합니다.
const user = { name: "Foo Bar" };

// schema를 이용해 user 데이터를 검증합니다.
const validation = schema.validate(user);

// 검증 결과값 중 error가 존재한다면 에러 메시지를 출력합니다.
if (validation.error) {
  console.log(validation.error.message);
} else {
  // 검증 결과값 중 error가 존재하지 않는다면, 데이터가 유효하다는 메시지를 출력합니다.
  console.log("Valid Data!");
}

//try catch 비동기로 문자열 길이 검증하기 검증에 실패시 에러 발생후 종료
try {
  // schema를 이용해 user 데이터를 검증합니다.
  const validation = await schema.validateAsync(user);
  // 검증 결과값 중 error가 존재하지 않는다면, 데이터가 유효하다는 메시지를 출력합니다.
  console.log("Valid Data!");
} catch (error) {
  // 검증에 실패한다면, 에러 메시지를 출력합니다.
  console.log(error.message);
}
