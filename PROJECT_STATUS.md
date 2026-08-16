# SeoulOS 98 — Final Project Status

> 작업 브랜치: `final-project-hardening`  
> 목적: main 배포 전 제품·콘텐츠·출처·QA를 분리 검증한다.

## Release principle

`main` 병합 및 최종 홍보 릴스 제작은 아래 조건을 모두 만족한 뒤 진행한다.

1. FILE 01~08 모두 실제 콘텐츠 확정
2. 사진/오디오 provenance 및 라이선스 검증
3. 이미지와 음원을 `assets/img`, `assets/audio`에 로컬 패키징
4. `author: "sample"` 0개
5. `audio.status: "pending_asset"` 0개
6. SeoulOS QA PASS
7. Release Readiness PASS
8. 실제 PC / iPhone Safari / Android Chrome 수동 QA

## Current content state

| FILE | Theme | Photo / provenance | Audio | Final |
|---|---|---|---|---|
| 01 | 을지로 밤 | 확정 | 확정·로컬 | YES |
| 02 | 광장시장의 저녁 | 후보 검증 완료 | 실제 광장시장 후보, 파일 미확보 | NO |
| 03 | 사라지는 오래된 간판 | 태광명판 후보 검증 | 대표 전기음 후보, 이용조건 추가 확인 필요 | NO |
| 04 | 언덕 위 오래된 동네 | 옥인동 후보 검증 완료 | 대표 환경음 후보, 파일 미확보 | NO |
| 05 | 세운상가의 기계와 부품 | HOLD — 개별 사진 라이선스 확인 필요 | 미확정 | NO |
| 06 | 사람이 빠져나간 지하상가 | 고투몰 후보 검증 완료 | 대표 환경음 후보, 파일 미확보 | NO |
| 07 | 오래된 아파트의 저녁 | 우성아파트 일대 후보 검증 완료 | 대표 환경음 후보, 파일 미확보 | NO |
| 08 | 철거를 기다리는 동네 | 구룡마을 후보 검증 완료 | 대표 철거 환경음 후보, 파일 미확보 | NO |

## Product hardening completed on this branch

- `Asia/Seoul` 달력 날짜 기준 Today File
- 1~8 `seriesOrder` 고정 슬롯으로 날짜→기억 매핑 안정화
- FILE DATE와 실제 SOURCE CAPTURED 분리
- 콘텐츠 provenance 런타임 QA
- localhost가 운영 Vercel 자산을 몰래 참조하던 동작 제거
- localStorage 사용 불가 사전 감지 + 사용자 경고
- GitHub Actions 정적 QA
- 이미지/오디오 로컬 파일 존재 및 실제 포맷 검사
- 별도 Release Readiness Gate
- GitHub Actions Node 24 런타임 업데이트

## Current release gate

자동 Release Readiness의 최근 결과:

- memories: 7/8
- finalized: 1/8
- sound attached: 1/8
- local images: 1/8
- local sounds: 1/8
- release blockers: 26

이 FAIL은 현재 제작 중 상태를 정확히 나타내는 의도된 결과다. 개발 QA는 PASS해야 하지만, Release Gate는 최종 8개가 모두 패키징될 때까지 PASS시키지 않는다.

## FILE 05 blocker

서울역사아카이브 세운상가 컬렉션에는 `뉴스타전자 내부모습`, `1983년에 구입한 공구함`, `광석라디오의 키트 세트(kit set)` 등 주제에 적합한 내부 기록이 존재한다. 다만 개별 사진의 재사용 조건을 자동으로 확정할 수 없어 현재 사용하지 않는다.

**Rule:** 개별 상세 페이지에서 재사용 가능한 라이선스/공공누리 조건이 확인되기 전에는 FILE 05에 넣지 않는다.

## Next work

1. FILE 05 개별 사진 라이선스 확인 또는 동급 공개 라이선스 대안 확보
2. 02~08 사진 원본을 로컬 `assets/img`로 패키징
3. 02~08 최종 오디오 확보·편집·로컬 패키징
4. 후보별 문장/메타데이터 최종 검수 후 `author: "user"` 승격
5. Release Gate PASS
6. 실제 기기 QA
7. main 병합 / Vercel production
8. 최종 17~18초 홍보 릴스
