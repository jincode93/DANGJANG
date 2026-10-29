# TabBar

앱 하단에 고정되는 주 메뉴로, 홈·검색·옷장·마이 네 칸이다.

## 소비자가 제공할 것
- 현재 탭에 `aria-current="page"`.
- 아이콘 `icon-lg` + 라벨. 현재 탭은 `-fill` 아이콘(`home-fill`, `closet-fill`, `user-fill`), 나머지는 선 아이콘. 라벨을 빼지 않는다.

## 규칙
- 높이 `tabbar-height` + 아래 안전 영역. 위 경계 `line` 1px.
- 현재 탭 `text-primary`, 나머지 `text-tertiary`. 초록은 쓰지 않는다.
