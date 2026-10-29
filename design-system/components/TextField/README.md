# TextField

실측처럼 짧은 값을 입력하는 칸으로, 라벨·단위·도움말을 함께 둔다.

## 소비자가 제공할 것
- 라벨(`label for`)과 `id`. 라벨은 칸 위에 늘 보이게 두고, placeholder로 대신하지 않는다.
- 숫자는 `inputmode="decimal"`, 단위는 `dj-unit`.
- 도움말에는 재는 방법을, 오류일 때는 무엇이 틀렸고 어떻게 고치는지를 쓴다.

## 규칙
- 기본 면 `bg-subtle`, 포커스 시 `bg` + 2px `text-primary` 테두리, 오류 시 2px `danger`.
