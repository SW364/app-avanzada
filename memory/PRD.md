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

## Update: 160 verbs + B nomenclature (June 2026)
- M1.A (modals for Voz Pasiva and BAT) uses the official list of 160 verbs (93 regular / 67 irregular)
- BAT: cards MM1.B (modals), MM2.B Presente, MM3.B Pasado, MM4.B Presente Perfecto, MM5.B Pasado Perfecto
- Removed the "Capítulo ..." subtitle under the carousel
- Reflexive verbs agree with the subject in BAT (disculparme, disculparnos)
- Testing: iteration_5 passed

## Update: AA chapters + M2.A verbs (June 2026)
- Voz Pasiva: Mm1.AA Presente, Mm2.AA Pasado, Mm3.AA Presente Perfecto, Mm4.AA Pasado Perfecto. Each tense is fixed (no auxiliary selector); the structure is applied automatically from the subject
- M2 modules (Voz Pasiva AA and BAT MM2.B–MM5.B) use only the 30 M2.A verbs (no tabs)
- Testing: iteration_6 passed

## Update: official structure (June 2026)
- Home: 2 cards (Voz Pasiva, Modo BAT) → /section/[id]
- Voz Pasiva: 8 modules (AA: Mm1–Mm4.AA, AB: Mm5–Mm8.AB with being / been being). The M1.A modals module was removed
- BAT: MM1.B (May, Must, Shall, Will, Might, Gonna, Wanna, Should, Would), MM2.B–MM5.B with fixed tenses
- Catalogs: Mm1/MM1 = 160 verbs, Mm2/MM2 = 30 invariable verbs, Mm3/MM3 = 58 regular verbs, Mm4/MM4 = 42 irregular verbs, MM5.B = invariable verbs (provisional), Mm5–Mm8.AB = 160, invariable, regular, irregular (assumed)
- Testing: iteration_7 passed

## Update: single verb catalog (June 2026)
- All 13 modules (Voz Pasiva and BAT) use the 160-verb list (Regulares/Irregulares). Voz Pasiva uses the past participle; BAT uses the infinitive

## Update: branding (June 2026)
- Icon, Android adaptive icon, splash and favicon now use the CalcuVerbs CV logo on a white background (#FFFFFF) to match the image
- app.json name: "CalcuVerbs Advanced" (bundle IDs unchanged). The splash stays visible until the fonts load

## Update: main menu (June 2026)
- New main menu (/): CV logo, "Hola y Bienvenidos a CalcuVerbs-Advanced", Módulos / Videos / Mis Notas buttons, link to www.CalcuVerbs.com
- The previous home screen moved to /modules (Voz Pasiva / Modo BAT); Videos and Mis Notas are placeholders
- Testing: iteration_9 passed

## Update: Mis Notas + Escuchar Frases (June 2026)
- Mis Notas: create, edit (autosave), delete; stored on the device (storage util)
- Escuchar Frases: speaker button on each card; backend /api/tts (OpenAI tts-1, voice nova, Emergent LLM key) cached in Mongo; the app downloads the mp3 and plays it with a single expo-audio player (silent mode, stops on back/background/Generar). Does not depend on the phone's TTS engine
- Testing: iterations 10-11 passed

## Backlog
- P1: Continuous chapters for Voz Pasiva (Mm5–8.AB: being / been being)
- P1: BAT appendices (gerund, "Ain't"); the 160-verb list from the BAT manual
- P2: Microphone / pronunciation practice, random exercises, progress tracking
