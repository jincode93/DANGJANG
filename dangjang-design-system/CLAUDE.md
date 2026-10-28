# 당장 디자인 시스템

작업을 시작하기 전에 `HANDOFF.md`를 읽는다. 답변은 한국어로 한다.

- 게시되는 파일은 `design-system/project/` 아래뿐이다. 토큰 원본은 `tokens.json`이고, `tokens.css`는 만들지 않는다.
- 아이콘은 `iconset/icons.py`에서 고치고 `python3 iconset/build.py`로 다시 만든다. 당근(SEED) 아이콘 모양은 가져오지 않는다.
- 색을 바꾸면 라이트·다크 대비(글자 4.5:1, 테두리·아이콘 3:1)를 다시 계산한다.
- 고친 뒤 `python3 tools/tokens_css.py && node tools/preview.js`로 라이트·다크 화면을 확인한다.
