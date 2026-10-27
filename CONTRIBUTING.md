# 참여하는 법

git을 몰라도 참여할 수 있다. 이 레포에서 무언가를 바꾸는 방법은 **PR(Pull Request, 바꿔 달라는 요청)** 하나뿐이다. 모두 같은 레포에 **브랜치(내 작업 공간)**를 만들어 고치고, PR로 올리고, 서로 리뷰한 뒤 합친다.

`main` 브랜치에는 누구도 직접 올릴 수 없다. PR은 코드 오너(준호)가 승인해야 합쳐진다. 그러니 잘못 올려도 `main`은 망가지지 않는다. 걱정하지 말고 올리면 된다.

## 처음 한 번

1. GitHub 계정을 만들고, 아이디를 준호에게 알려 준다.
2. 메일로 온 초대(Collaborator invitation)를 수락한다.

## 무엇을 PR로 올리나

| 하고 싶은 것 | 어디를 고치나 |
|---|---|
| 정책이나 용어가 이상하다 | `docs/policy/`의 해당 규칙, `docs/glossary.md`의 해당 용어 |
| 새 기능을 제안한다 | `docs/proposals/`에 새 파일 (양식은 `docs/proposals/README.md`) |

처음이면 `docs/policy/README.md`(정책 목차)와 `docs/glossary.md`(용어집)부터 읽는다.

## 방법 1. GitHub 웹에서 (설치 없음, 가장 쉬움)

1. GitHub에서 고칠 파일을 연다.
2. 오른쪽 위 연필 버튼(Edit)을 누른다.
3. 내용을 고친다. 새 제안 파일은 `docs/proposals` 폴더에서 "Add file → Create new file"로 만든다.
4. "Commit changes"를 누르고 **"Create a new branch for this commit and start a pull request"**를 고른다. 브랜치 이름은 `내이름/주제`로 쓴다(예: `minji/rec-04-판정기준`).
5. PR 양식이 나오면 채우고 "Create pull request"를 누른다.

## 방법 2. Claude Code로

처음 한 번만 레포를 내 컴퓨터에 받는다.

```bash
gh auth login
```

```bash
gh repo clone jincode93/DANGJANG
```

그다음부터는 받은 폴더에서 Claude Code에게 이렇게 말하면 된다.

> "REC-04 판정 기준이 이상한 것 같아. 부위별로 다르게 하자는 내용으로 고치고 PR 올려줘."

Claude는 `CLAUDE.md`의 협업 규칙에 따라 최신 `main`을 받고, 내 브랜치를 만들어 고치고, PR을 연다.

## 다른 사람의 PR 리뷰하기

PR 목록(Pull requests 탭)에서 PR을 열고 "Files changed"에서 줄마다 댓글을 달 수 있다. 다 봤으면 "Review changes"에서 의견을 남긴다. 합치는 것은 코드 오너가 승인한 뒤다.

## 지킬 것

- **PR 하나에 주제 하나.** 작게 나눌수록 충돌이 적고 검토가 빠르다.
- **`logs/decision-log.md`와 `reviews/scores.csv`는 고치지 않는다.** 모두가 같은 자리에 줄을 추가해 충돌이 나는 파일이다. 결정 이유는 PR 설명에 쓰면, 합칠 때 관리자가 기록한다.
- **정책에는 확정된 것만 넣는다.** 아직 의견 단계면 `docs/proposals/`나 `docs/open-questions.md`에 둔다.
- **다른 사람의 브랜치와 제안 파일은 고치지 않는다.** 의견은 PR 댓글로 남긴다.
- **공개 레포다.** 실명, 연락처, 인터뷰 원문 같은 개인정보를 올리지 않는다.

## PR을 올린 뒤

- 코드 오너나 다른 팀원이 댓글로 질문하거나 수정을 부탁할 수 있다. 같은 브랜치에서 고치면 PR에 바로 반영된다.
- 합쳐지면 PR이 "Merged"로 바뀌고 브랜치는 자동으로 지워진다. 합치지 않기로 하면 이유와 함께 닫는다.
