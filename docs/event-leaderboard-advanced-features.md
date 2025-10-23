# Event Leaderboard 고급 테이블 기능 설계

## 📋 개요

Event Leaderboard에 대화형 테이블 기능을 추가하여 사용자 경험을 향상시킵니다.

## 🎯 목표

기본 테이블을 **고급 대화형 테이블**로 업그레이드:
- 사용자가 원하는 정보를 빠르게 찾을 수 있도록
- 대용량 데이터(1000+ 결과)를 효율적으로 표시
- 모바일에서도 완전한 기능 제공

## ✨ 추가할 기능

### 1. Accordion (열고 닫기) + Category Tabs

**목적**: 페이지 스크롤 최소화, 선택적 정보 표시, 카테고리별 결과 구분

**동작**:
```
┌─────────────────────────────────────────────────────┐
│ 🏆 Event Leaderboard                         [▼]    │
├─────────────────────────────────────────────────────┤
│ [5K (150)] [10K (126)]     276 results found        │ ← justify-between
│                                                      │
│ [Search: ________]                                  │
│ [Division ▼] [Gender ▼]                             │
│                                                      │
│ [Table with 50 rows...]                             │
│ [Pagination]                                         │
└─────────────────────────────────────────────────────┘

[Click ▲]

┌─────────────────────────────────────────────────────┐
│ 🏆 Event Leaderboard                         [▲]    │
└─────────────────────────────────────────────────────┘
```

**구현**:
- Shadcn/ui Accordion 컴포넌트 사용
- 기본값: 열림 (defaultValue="leaderboard")
- 카테고리 탭은 Accordion 내부에 위치
- 다중 카테고리: 탭 표시 + results count
- 단일 카테고리: 탭 숨김

---

### 2. 페이지네이션

**목적**: 대용량 데이터 성능 최적화

**스펙**:
- **초기 표시**: 50개 행
- **페이지 크기 옵션**: 25, 50, 100
- **총 페이지 표시**: "Page 1 of 3 (142 results)"
- **네비게이션**: 이전/다음, 첫 페이지/마지막 페이지

**UI**:
```
┌─────────────────────────────────────────┐
│ Rows per page: [25 ▼] [50] [100]       │
│                                         │
│ [◄◄] [◄] Page 1 of 3 [►] [►►]         │
│                                         │
│ Showing 1-50 of 142 results             │
└─────────────────────────────────────────┘
```

---

### 3. 필터 및 정렬

#### 3.1 필터

**Division 필터**:
```
┌─────────────────────────┐
│ Division: [All ▼]       │
│  ├─ All                 │
│  ├─ Male Overall        │
│  ├─ Female Overall      │
│  ├─ M 20-24             │
│  ├─ M 25-29             │
│  └─ ...                 │
└─────────────────────────┘
```

**Gender 필터**:
```
┌─────────────────────────┐
│ Gender: [All ▼]         │
│  ├─ All Genders         │
│  ├─ Male                │
│  └─ Female              │
└─────────────────────────┘
```

**레이아웃**:
- 검색: 전체 너비
- 필터: 2-column 그리드 (Division, Gender)
- 인풋 배경: white
- ~~Age 범위 필터 제거됨~~

#### 3.2 정렬

**모든 컬럼 정렬 가능**:
- Rank (기본값: 오름차순)
- Bib
- Name (알파벳순)
- Chip Time
- Division Place
- Pace
- Age Performance (조건부)

**3-State 정렬 로직**:
1. 기본 (정렬 없음) → ChevronsUpDown 아이콘
2. Click → 내림차순 (Desc) → ChevronDown 아이콘
3. Click → 오름차순 (Asc) → ChevronUp 아이콘
4. Click → 기본 (정렬 없음) → ChevronsUpDown 아이콘

**UI**:
```
┌────────────────────────────────────────┐
│ Rank ⇅  Bib ⇅  Name ⇅  Chip Time ▼    │
└────────────────────────────────────────┘
```

**아이콘** (lucide-react):
- `ChevronUp` (▲) - 오름차순
- `ChevronDown` (▼) - 내림차순
- `ChevronsUpDown` (⇅) - 정렬 가능 (기본)

---

### 4. Division 내 1등 하이라이트 + Tooltip

**목적**: Division 우승자 강조 및 사용자 정보 제공

**로직**:
```typescript
// Division별 첫 번째 발견자가 1등
export function markDivisionWinners(
  results: LeaderboardResult[]
): EnhancedLeaderboardResult[] {
  const divisionFirsts = new Map<string, boolean>();

  return results.map((result) => {
    const division = result.division || "Unknown";
    const isDivisionWinner = !divisionFirsts.has(division);

    if (isDivisionWinner) {
      divisionFirsts.set(division, true);
    }

    return {
      ...result,
      isDivisionWinner,
      isOverallWinner: result.rank <= 3,
    };
  });
}
```

**스타일**:
```
┌────────────────────────────────────┐
│ 1  1703  ABDULLAH ABBASI      🥇  │ ← Overall 1등 (금색 배경)
├────────────────────────────────────┤
│ 2  1787  LAWRENCE TOPOR        🏅 │ ← Division 1등 (파란 보더)
├────────────────────────────────────┤
│ 42 5000  YOU (Zerone)          🔵 │ ← 사용자 행 (파란 배경)
└────────────────────────────────────┘
```

**색상 및 스타일**:
- Overall 1등: 금색 배경 + 좌측 보더 (`bg-yellow-50/30 border-l-4 border-yellow-400`)
- Division 1등: 파란색 좌측 보더 (`border-l-4 border-blue-400`)
- 사용자 행: 파란색 배경 + 좌측 보더 (`bg-primary/10 border-l-4 border-primary`)
- **모든 행**: 좌측 border만 표시 (상하 border 제거)
- Row height: 고정 `h-16`

**Tooltip**:
- Overall 1등: "🏆 Overall Winner - 1st Place"
- Overall 2등: "🥈 Overall Winner - 2nd Place"
- Overall 3등: "🥉 Overall Winner - 3rd Place"
- Division 1등: "🏅 Division Winner - 1st in M 50-54"
- 사용자 행: "Your Result"
- Tooltip 배경: `bg-foreground` (어두운 배경)
- Tooltip 텍스트: `text-background` (흰색)
- 위치: `align="start"` (Rank 컬럼 쪽)

---

### 5. 내 정보 고정 (Sticky User Row)

**목적**: 사용자가 스크롤해도 자신의 순위를 항상 볼 수 있도록

**중요**: 사용자가 **참가한 카테고리에서만** Sticky Row 표시
- 5K 참가자 → 5K 탭에서만 Sticky Row 표시, 10K 탭에서는 숨김
- 10K 참가자 → 10K 탭에서만 Sticky Row 표시, 5K 탭에서는 숨김

**동작**:
```
┌────────────────────────────────────┐
│ Rank  Bib   Name         Time      │ ← Header (sticky, top-0)
├────────────────────────────────────┤
│ 42   5000  YOU (Zerone)  25:30 🔵 │ ← Your Row (sticky, top-[52px])
├────────────────────────────────────┤
│ 1    1703  ABDULLAH       19:07 🥇│
│ 2    1787  LAWRENCE       19:24 🥈│
│ 3    ...                           │
│ ...                                │
└────────────────────────────────────┘

[Scroll down]

┌────────────────────────────────────┐
│ Rank  Bib   Name         Time      │ ← Header (sticky, top-0)
├────────────────────────────────────┤
│ 42   5000  YOU (Zerone)  25:30 🔵 │ ← Your Row (still visible!)
├────────────────────────────────────┤
│ 50   ...                           │
│ 51   ...                           │
│ ...                                │
└────────────────────────────────────┘
```

**구현**:
- CSS `position: sticky; top: 52px` (헤더 높이만큼 아래)
- TanStack Table의 Row 객체 사용 (`flexRender`)
- processedData에서 사용자 존재 여부 확인
- 시각적 구분: 파란색 좌측 보더 + 배경색 (`bg-primary/10 border-l-4 border-primary`)
- User 아이콘 추가 (lucide-react)

---

### 6. 검색 기능

**검색 범위**:
- Bib Number (정확 일치 or 부분 일치)
- Runner Name (대소문자 무시, 부분 일치)

**UI**:
```
┌────────────────────────────────────┐
│ 🔍 Search by name or bib number   │
│ ┌──────────────────────────────┐  │
│ │ abdul                    [×] │  │
│ └──────────────────────────────┘  │
│                                    │
│ Found 1 result                     │
└────────────────────────────────────┘
```

**동작**:
- 실시간 검색 (debounced 300ms)
- 빈 검색어: 모든 결과 표시
- 결과 없음: "No results found" 메시지

---

## 🛠️ 기술 스택

### TanStack Table v8

**선택 이유**:
- ✅ 고급 테이블 기능 내장 (정렬, 필터, 페이지네이션)
- ✅ Headless UI (완전한 스타일 커스터마이징)
- ✅ TypeScript 지원
- ✅ 성능 최적화 (가상화 지원)
- ✅ 작은 번들 크기 (~14kb)

**대안 비교**:

| 기능 | 직접 구현 | TanStack Table |
|------|-----------|----------------|
| 개발 시간 | 8-12시간 | 3-5시간 |
| 유지보수 | 복잡 | 간단 |
| 버그 위험 | 높음 | 낮음 |
| 확장성 | 제한적 | 우수 |
| 번들 크기 | 비슷 | 14kb |

**결론**: TanStack Table 사용 ✅

---

## 📱 모바일 UI

### 기존 계획 (카드뷰) → 변경 (테이블뷰)

**이유**:
- 검색/필터 기능이 테이블에 통합됨
- 페이지네이션이 테이블 전용
- 두 개의 UI 유지 관리 부담

**모바일 테이블 최적화**:

#### 1. 반응형 컬럼 숨기기
```typescript
// Desktop: 8개 컬럼
// Tablet: 5개 컬럼 (City, State 숨김)
// Mobile: 4개 컬럼 (Division, Div. Place 숨김)
```

#### 2. 가로 스크롤
```css
.table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
```

#### 3. 터치 최적화
- 행 높이: 48px (터치 영역 충분)
- 폰트 크기: 14px (가독성)
- 패딩: 12px (여백)

---

## 🎨 컴포넌트 구조

```
src/app/events/[event]/[bib]/_components/
  EventLeaderboard.tsx                    (메인 컨테이너)
  ├── leaderboard-table/
  │   ├── LeaderboardTableAdvanced.tsx   (TanStack Table)
  │   ├── LeaderboardFilters.tsx         (검색/필터)
  │   ├── LeaderboardPagination.tsx      (페이지네이션)
  │   ├── StickyUserRow.tsx              (내 정보 고정)
  │   ├── columns.tsx                    (컬럼 정의)
  │   └── utils.ts                       (헬퍼 함수)
  └── EventLeaderboardSkeleton.tsx       (로딩 상태)
```

---

## 📊 데이터 흐름

```
EventLeaderboard (Container)
        ↓
  [State Management]
  - selectedCategory
  - searchQuery
  - filters (division, gender, age)
  - sorting
  - pagination (page, pageSize)
        ↓
  useQuery (tRPC)
  - 서버에서 전체 데이터 가져오기
        ↓
  Client-side Processing
  1. 검색어 필터링
  2. Division/Gender 필터 적용
  3. Age 범위 필터 적용
  4. 정렬 적용
  5. 페이지네이션 적용
        ↓
  TanStack Table
  - 필터링된 데이터 렌더링
  - Sticky User Row 렌더링
  - Division 1등 하이라이트
        ↓
  UI 렌더링
```

---

## 🎯 사용자 시나리오

### 시나리오 1: 내 결과 빠르게 확인
1. 페이지 로드
2. 내 Bib (5000) 자동 하이라이트
3. 헤더 바로 아래 내 정보 고정
4. 스크롤 없이 바로 확인 ✅

### 시나리오 2: Division 우승자 찾기
1. Division 필터 선택: "M 25-29"
2. 테이블 자동 필터링
3. 첫 번째 행에 Division 1등 표시 (파란 보더)
4. 상세 정보 확인 ✅

### 시나리오 3: 친구 결과 검색
1. 검색 박스에 "LAWRENCE" 입력
2. 실시간 필터링 (300ms debounce)
3. 1개 결과 표시: "LAWRENCE TOPOR"
4. 결과 확인 ✅

### 시나리오 4: 나이별 순위 보기
1. Age 범위 설정: 50-59
2. Gender 필터: Male
3. Chip Time 기준 정렬
4. 해당 나이대 순위 확인 ✅

---

## 🚀 성능 최적화

### 1. 클라이언트 사이드 필터링

**장점**:
- 즉각적인 반응 (네트워크 지연 없음)
- 서버 부하 감소
- 오프라인에서도 필터 작동

**단점**:
- 초기 로드 시 모든 데이터 전송
- 메모리 사용량 증가

**적합한 경우**:
- 데이터셋 < 5000 rows
- 대부분의 마라톤 이벤트 (100-1000 참가자)

### 2. Memoization

```typescript
const filteredData = useMemo(() => {
  let data = results;

  // 검색
  if (searchQuery) {
    data = data.filter(r =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.bib.includes(searchQuery)
    );
  }

  // Division 필터
  if (selectedDivision !== 'all') {
    data = data.filter(r => r.division === selectedDivision);
  }

  return data;
}, [results, searchQuery, selectedDivision]);
```

### 3. Debounced 검색

```typescript
const [searchQuery, setSearchQuery] = useState('');
const debouncedSearch = useDebouncedValue(searchQuery, 300);
```

### 4. Virtual Scrolling (미래 최적화)

TanStack Table + TanStack Virtual 사용:
- 1000+ 행에서만 활성화
- 초기에는 불필요

---

## 🎨 UI/UX 디자인

### 색상 체계

**하이라이트**:
```css
/* Overall 1등 */
.overall-winner {
  background: rgb(254 249 195 / 0.3); /* yellow-50 */
  border-left: 4px solid rgb(250 204 21); /* yellow-400 */
}

/* Division 1등 */
.division-winner {
  border-left: 4px solid rgb(59 130 246); /* blue-500 */
}

/* 내 정보 */
.user-row {
  background: rgb(219 234 254 / 0.3); /* blue-50 */
  border-left: 4px solid rgb(37 99 235); /* blue-600 */
  font-weight: 600;
}

/* Hover */
.table-row:hover {
  background: rgb(249 250 251); /* gray-50 */
}
```

### 아이콘

**메달**:
- 🥇 1등 (Overall)
- 🥈 2등
- 🥉 3등

**Division 1등**:
- 🏅 또는 파란색 ● 또는 ⭐

**정렬**:
- ⬆️ 오름차순
- ⬇️ 내림차순

---

## 📝 접근성 (Accessibility)

### ARIA 속성

```tsx
<table role="table" aria-label="Race results">
  <thead>
    <tr role="row">
      <th
        role="columnheader"
        aria-sort={sorting.rank}
        tabIndex={0}
      >
        Rank
      </th>
    </tr>
  </thead>
</table>
```

### 키보드 네비게이션

- `Tab`: 다음 컨트롤로 이동
- `Enter`: 정렬 토글
- `Arrow Keys`: 페이지 네비게이션

---

## 🧪 테스트 계획

### 단위 테스트
- [ ] 검색 필터링 로직
- [ ] Division 그룹핑 로직
- [ ] Sticky row 위치 계산
- [ ] 페이지네이션 계산

### 통합 테스트
- [ ] 필터 + 검색 조합
- [ ] 정렬 + 페이지네이션
- [ ] 모든 기능 동시 사용

### E2E 테스트
- [ ] 사용자 시나리오 1-4 검증
- [ ] 모바일 반응형 테스트
- [ ] 성능 테스트 (1000+ 행)

---

## 📈 성공 지표

- [ ] 검색 응답 시간 < 300ms
- [ ] 페이지 전환 < 100ms
- [ ] 초기 렌더링 < 2s
- [ ] 모바일 Lighthouse 점수 > 90
- [ ] 사용자 피드백 긍정적

---

## 🔮 미래 개선 사항

### Phase 2
- [ ] Export to CSV/PDF
- [ ] Share specific result (URL with filters)
- [ ] Compare with previous year
- [ ] Personal PR tracking

### Phase 3
- [ ] Real-time updates during live events
- [ ] Advanced analytics (pace chart, split times)
- [ ] Social sharing integration

---

### 7. 조건부 Performance 컬럼

**목적**: 데이터가 없을 때 불필요한 컬럼 숨기기

**로직**:
```typescript
const hasPerformanceData = useMemo(() => {
  return processedData.some(
    (row) => row.agePerformance && row.agePerformance > 0
  );
}, [processedData]);

const visibleColumns = useMemo(() => {
  if (hasPerformanceData) return columns;
  return columns.filter(
    (col) => !("accessorKey" in col) || col.accessorKey !== "agePerformance"
  );
}, [hasPerformanceData]);
```

**동작**:
- `agePerformance` 값이 1개 이상 존재: Performance 컬럼 표시
- 모든 `agePerformance`가 null/0: Performance 컬럼 숨김

---

### 8. 컬럼 정렬

**중앙 정렬 컬럼**:
- Chip Time
- Pace
- Div. Place

**구현**:
```tsx
{
  accessorKey: "chipTime",
  header: ({ column }) => (
    <div className="flex justify-center">
      <Button>Chip Time <SortIcon /></Button>
    </div>
  ),
  cell: ({ row }) => (
    <div className="text-center">
      <span className="font-mono">{row.original.chipTime}</span>
    </div>
  ),
}
```

---

## 📝 주요 개선사항 요약

### UI/UX 개선
1. ✅ 카테고리 탭을 Accordion 내부로 이동
2. ✅ 탭과 results count를 justify-between으로 양쪽 배치
3. ✅ Age 범위 필터 제거 (불필요)
4. ✅ 필터 레이아웃 개선 (2-column 그리드)
5. ✅ 입력 필드 white 배경
6. ✅ 3-state Chevron 정렬 아이콘
7. ✅ Tooltip 추가 (하이라이트 행)
8. ✅ Row height 고정 (h-16)
9. ✅ 좌측 border만 표시

### 기능 개선
1. ✅ Sticky user row는 참가 카테고리에서만 표시
2. ✅ Performance 컬럼 조건부 표시
3. ✅ 컬럼 중앙 정렬 (시간/숫자)
4. ✅ 다중 카테고리 자동 탭 표시
5. ✅ Tooltip 위치 조정 (Rank 쪽)

### 성능 최적화
1. ✅ useMemo로 불필요한 재계산 방지
2. ✅ Debounced 검색 (300ms)
3. ✅ 조건부 컬럼 렌더링
4. ✅ 클라이언트 사이드 필터링

---

**작성일**: 2025-10-23
**최종 수정일**: 2025-10-23
**버전**: 3.0
**상태**: ✅ 구현 완료
