# CalcuVerbs-Advanced — PRD

## Original problem statement
Implement the data structure and conjugation modules for: 1) VOZ PASIVA (M1.A modals + be + PP; M2.A the 4 tenses am/is/are, was/were, has/have been, had been + PP) and 2) MODO BAT (M1.A modals + be able to + verb; M2.A the 4 tenses). Select person, tense/modal, verb, and generate the sentence in EN + ES. No microphone or random exercises yet. Follow the official CalcuVerbs manuals (PDFs).

## User choices
- Verb catalog taken from the PDFs (M2.A, M3.A, M4.A lists)
- Local logic only (no backend), works offline
- Affirmative, negative and interrogative forms
- CalcuVerbs style: rainbow CV logo, dark blue titles, blue for present tenses, yellow for past tenses

## Architecture
- Expo Router: `/` (Home), `/module/[id]`, `/conjugator?module&mode&key`, `/table?module&mode&key&verb`
- `src/data/verbs.ts` (131 verbs, Spanish participle generated automatically), `src/data/curriculum.ts` (sections, chapters, manual codes), `src/logic/conjugate.ts` (EN/ES engine with gender/number agreement)
- Fonts: Caveat + Fredoka (expo-font); icons: @react-native-vector-icons/ionicons

## Implemented (June 2026)
- Home with the 2 modules; module screen with M1.A (modal grid) and M2.A (color-coded chapters with Mm/MM codes)
- Conjugator: modal/tense chips, 7 pronouns, verb sheet with search + group filter, form segment, EN/ES result card (BAT negative includes "unable to")
- Full table for all 7 people for each form
- Testing: 14/14 passed (iteration_1)

## Update: UI matching the original app (June 2026)
- The UI was rebuilt to match the original repo github.com/SW364/calcuverbsApk: blue gradient background, Nunito fonts, "Módulos" grid (2 columns, colored cards with H pill), practice screen with drag carousels (subject + auxiliary/tense), verb modal (Regulares/Irregulares tabs, search), "Generar" button, AFIRMATIVA + NEGATIVA/PREGUNTA cards with the auxiliary highlighted, plus the Spanish translation in italics
- Menu: Solo inglés / Inglés → Español
- Routes: /, /practice/[pv-m1a|pv-m2a|bat-m1a|bat-m2a]
- Testing: iteration_2 18/18 passed

## Backlog
- P1: Continuous chapters for Voz Pasiva (Mm5–8.AB: being / been being)
- P1: BAT appendices (gerund, "Ain't"); the 160-verb list from the BAT manual
- P2: Microphone / pronunciation practice, random exercises, progress tracking
