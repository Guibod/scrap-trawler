# Changelog
All notable changes to this project will be documented in this file. See [conventional commits](https://www.conventionalcommits.org/) for commit guidelines.

- - -
## 0.17.0 - 2025-04-12
#### Features
- setup upload screen allow to override the event format - (065378b) - Guillaume Boddaert
#### Miscellaneous Chores
- **(deps)** bump @types/node from 22.13.9 to 22.14.0 - (c8b3d44) - dependabot[bot]
- **(deps)** bump @types/chrome from 0.0.304 to 0.0.313 - (1bc4a7e) - dependabot[bot]
- **(deps)** bump motion from 12.5.0 to 12.6.3 - (0c57be1) - dependabot[bot]
- **(release)** sync package.json version - (30a6a06) - Cog Bot
- **(release)** update changelog.json - (2d84c0c) - Cog Bot
- spreadsheet stores a specific format for the event that overrides eventlink value - (5b57719) - Guillaume Boddaert

- - -

## 0.16.0 - 2025-04-11
#### Bug Fixes
- moved the fetch button for deck outside of the hidden section in player page - (2fcf82f) - Guillaume Boddaert
#### Features
- illegal cards should be highlighted in red for eventlink supported formats (not DUEL) - (8286099) - Guillaume Boddaert
- a deck that failed to be fetch has a small description of the issue - (53656ea) - Guillaume Boddaert
- added proxy capability to support magic-ville - (a79a881) - Guillaume Boddaert
- Added magicville fetcher support - (7bc8dbd) - Guillaume Boddaert
#### Miscellaneous Chores
- **(release)** sync package.json version - (1802f6a) - Cog Bot
- **(release)** update changelog.json - (149f082) - Cog Bot
- resolved some minor typing issue - (0842856) - Guillaume Boddaert
- centered player match items properly if name is too large - (24f10e3) - Guillaume Boddaert
- silenced improper key for player standings item in react - (09d0d62) - Guillaume Boddaert
#### Refactoring
- fetch request now defines the requested format - (8d44c6d) - Guillaume Boddaert
#### Tests
- fix a erratic test where bye is causing trouble - (18e55c1) - Guillaume Boddaert
- corrected a typing issue in player selector test - (90482ea) - Guillaume Boddaert

- - -

## 0.15.0 - 2025-04-05
#### Bug Fixes
- alternative layout cards (meld, mdfc, dfc, flip) are now properly imported - (6e89705) - Guillaume Boddaert
#### Continuous Integration
- a coverage regression will not block the release process - (8726f2f) - Guillaume Boddaert
#### Features
- player page - (c3b6a0d) - Guillaume Boddaert
#### Miscellaneous Chores
- **(deps)** bump framer-motion from 12.5.0 to 12.6.2 - (9a40547) - dependabot[bot]
- **(release)** sync package.json version - (d6403e8) - Cog Bot
- **(release)** update changelog.json - (4f48e2e) - Cog Bot
- added manaCost to available data in the CardDbo - (8f17a73) - Guillaume Boddaert
- refactored routing for event pages - (2c5806f) - Guillaume Boddaert
- added resolved deck mapper - (782d976) - Guillaume Boddaert
- added clsx cn helper - (ff4a4ec) - Guillaume Boddaert
- added PlayerSelector component - (18fb070) - Guillaume Boddaert
- PlayerProfile now also provides matches - (7583408) - Guillaume Boddaert
- deck source is now a property of the deck dbo and entity - (17611f6) - Guillaume Boddaert
#### Tests
- silenced an error in test - (0d92b0f) - Guillaume Boddaert

- - -

## 0.14.0 - 2025-03-30
#### Continuous Integration
- disabled lint-staged on commit - (469b1a1) - Guillaume Boddaert
- added pre-push prior sending a request to github - (c5a7941) - Guillaume Boddaert
- lint staged is configured through package.json only - (57aaa3c) - Guillaume Boddaert
#### Features
- scrape button is available on live event page - (1fc52c5) - Guillaume Boddaert
- live event will auto scrape every 10 minutes - (f3c4dd2) - Guillaume Boddaert
#### Miscellaneous Chores
- **(deps)** bump vite from 6.2.2 to 6.2.3 in the npm_and_yarn group - (31ee290) - dependabot[bot]
- **(release)** sync package.json version - (427f175) - Cog Bot
- **(release)** update changelog.json - (4adb0a8) - Cog Bot
- refactored storage of event scrape status - (a769c8c) - Guillaume Boddaert
- refactored the whole eventlink scrape chain - (7a530c4) - Guillaume Boddaert
- added lastScrapedAt data to event model and entity - (68cd425) - Guillaume Boddaert
- removed unused event-summary message - (40e588c) - Guillaume Boddaert
- removed unused event-open message - (cd82a5a) - Guillaume Boddaert

- - -

## 0.13.0 - 2025-03-29
#### Bug Fixes
- event provider don’t blink the screen upon refreshEvent, only for initial fetch - (09e2efa) - Guillaume Boddaert
#### Features
- added many improvement to the event list page - (8081b49) - Guillaume Boddaert
#### Miscellaneous Chores
- **(release)** sync package.json version - (b7a335c) - Cog Bot
- **(release)** update changelog.json - (c43769b) - Cog Bot
- more coverage on utils functions - (8a0d866) - Guillaume Boddaert
- refactored the ui of event table component - (0005f74) - Guillaume Boddaert
- added database observer - (df97c7a) - Guillaume Boddaert
- restored broken types in setup status tests - (a3125ef) - Guillaume Boddaert
- added error-boundary to catch fatal react errors - (7246a1e) - Guillaume Boddaert

- - -

## 0.12.0 - 2025-03-27
#### Features
- added a select box in the pairing page to filter players out/in - (041be55) - Guillaume Boddaert
- fixed many dragndrop behavior on pairing page - (04cd17c) - Guillaume Boddaert
#### Miscellaneous Chores
- **(release)** sync package.json version - (8d73bf7) - Cog Bot
- **(release)** update changelog.json - (e2c46bc) - Cog Bot
#### Refactoring
- setup pairings - (9cdb957) - Guillaume Boddaert

- - -

## 0.11.2 - 2025-03-26
#### Bug Fixes
- unassigned player chip in player pool are not clipped on animation anymore - (0199c87) - Guillaume Boddaert
- in pairing view, the step is considered done if all players are mapped - (8b32374) - Guillaume Boddaert
- in pairing view the right column chips are more readable - (dc7518f) - Guillaume Boddaert
- pairing page was broken if no mapping was available yet - (fcf00be) - Guillaume Boddaert
- spreadsheet autodetection is restored - (9e20dde) - Guillaume Boddaert
#### Miscellaneous Chores
- **(release)** sync package.json version - (fbf98c7) - Cog Bot
- **(release)** update changelog.json - (3c28a47) - Cog Bot

- - -

## 0.11.1 - 2025-03-24
#### Bug Fixes
- added a small text to explain dnd support on pairing page - (80e65da) - Guillaume Boddaert
- rankings are sorted numerically not as string - (8be0c95) - Guillaume Boddaert
#### Continuous Integration
- reverted change in bump order - (f4c8acf) - Guillaume Boddaert
- reverted change in bump order - (6045fc5) - Guillaume Boddaert
- changelog and package.json are bumped before commit. - (462a944) - Guillaume Boddaert
#### Miscellaneous Chores
- **(deps)** bump lucide-react from 0.482.0 to 0.483.0 - (e0ef397) - dependabot[bot]
- **(deps)** bump eslint from 9.22.0 to 9.23.0 - (72777cf) - dependabot[bot]
- **(release)** sync package.json version - (5ab2628) - Cog Bot
- **(release)** update changelog.json - (0050983) - Cog Bot

- - -

## 0.11.0 - 2025-03-24
#### Bug Fixes
- removed dependency to lodash - (c37685a) - Guillaume Boddaert
- spreadsheet data was never available - (379399b) - Guillaume Boddaert
- import/export was not working - (50f692f) - Guillaume Boddaert
#### Continuous Integration
- removed tsc type check from ci - (b66f60b) - Guillaume Boddaert
- attempt to fix ci because of generated pnpm-loc.yaml in cloudflare-proxy - (5f2c6e0) - Guillaume Boddaert
- relaxed codecov 85% is too much - (5a1020d) - Guillaume Boddaert
- removed tsc type check from ci - (802cb7c) - Guillaume Boddaert
- tsc is now part of the build process - (e5f8383) - Guillaume Boddaert
#### Features
- added configuration for a cloudflare proxy - (8a7921c) - Guillaume Boddaert
- fetch related ui - (350e35e) - Guillaume Boddaert
- fetcher provider - (6222154) - Guillaume Boddaert
- added DeckFetchService() - (14f7fd0) - Guillaume Boddaert
- added mtgjson ui components - (bb7886a) - Guillaume Boddaert
#### Miscellaneous Chores
- **(deps)** bump vitest-mock-extended from 2.0.2 to 3.0.1 - (3a55b6e) - dependabot[bot]
- **(deps)** bump react-router-dom from 7.3.0 to 7.4.0 - (a46a11e) - dependabot[bot]
- **(deps)** bump framer-motion from 12.4.10 to 12.5.0 - (49784cc) - dependabot[bot]
- **(deps)** bump the npm_and_yarn group with 2 updates - (98f55f2) - dependabot[bot]
- **(deps)** bump lucide-react from 0.475.0 to 0.482.0 - (9769729) - dependabot[bot]
- **(release)** sync package.json version - (6aa8d7b) - Cog Bot
- **(release)** update changelog.json - (0075399) - Cog Bot
- typing issue in status.test.tsx - (6a2786c) - Guillaume Boddaert
- removed ability to setup moxfield key since we use our own reverse proxy - (f5b05f5) - Guillaume Boddaert
- fixed development extension id - (733265c) - Guillaume Boddaert
- added decks to event dbo, and entities - (8a75824) - Guillaume Boddaert
- added many lint-staged checks - (36a26bb) - Guillaume Boddaert
- getHumanVersion() method added - (4f7d6c0) - Guillaume Boddaert
- fixed some typescript issues - (ca4c139) - Guillaume Boddaert
- got rid of pako in favor of fflate that’s more easier to use - (c0a1b4f) - Guillaume Boddaert
- silenced typing errors - (57540c8) - Guillaume Boddaert
- reorganized background messages - (707331c) - Guillaume Boddaert
- fixed some typescript issues in graphql client - (31db77f) - Guillaume Boddaert
- SettingsService has a singleton pattern - (31d99bc) - Guillaume Boddaert
- EventService has a singleton pattern - (8e43467) - Guillaume Boddaert
- SettingsDao uses a singleton pattern - (5d060c4) - Guillaume Boddaert
- EventDao uses a singleton pattern - (0987129) - Guillaume Boddaert
- database is a service with singletons - (d34eaf3) - Guillaume Boddaert
- tsconfig path was changed to something recognized by webstorm - (8b21d11) - Guillaume Boddaert
#### Tests
- window.matchMedia is globally mocked - (da0ab0d) - Guillaume Boddaert
- added more coverage - (1c6308e) - Guillaume Boddaert
- chrome object is globally stubbed using vitest configuration - (979416b) - Guillaume Boddaert

- - -

## 0.10.0 - 2025-03-13
#### Bug Fixes
- layout content should not overflow anymore - (ab71bd2) - Guillaume Boddaert
- XSLX support recovered - (b941712) - Guillaume Boddaert
- scraping and saving were broken - (ab620d3) - Guillaume Boddaert
- scrape button uses font-sans instead of times - (5b0a34d) - Guillaume Boddaert
#### Continuous Integration
- git-cliff used to generate changelog.json is installed on ci host (for release only) - (975e67d) - Guillaume Boddaert
- a light changelog.json is added to the sources of the project - (b9e441c) - Guillaume Boddaert
- release job won’t complain about missing coverage anymore - (649e810) - Guillaume Boddaert
#### Features
- welcome page opens at first launch of the application. - (72937bc) - Guillaume Boddaert
- added about/welcome page - (f99227f) - Guillaume Boddaert
- added a changelog page - (f2c54d5) - Guillaume Boddaert
- application don’t open a sidepanel, but a popup on button click - (edc7d9c) - Guillaume Boddaert
- added support for dark theme - (4d7ed21) - Guillaume Boddaert
- added minimalistic option page - (60802a9) - Guillaume Boddaert
#### Miscellaneous Chores
- Settings provider uses the new SettingsService - (7c6542c) - Guillaume Boddaert
- more debug in the event dao - (503ccca) - Guillaume Boddaert
- better flow between event and event setup provider - (b53acd1) - Guillaume Boddaert
- main app herouiprovider uses navigate and href from the router - (4d81edd) - Guillaume Boddaert
- updated pnpm-lock.yaml - (e825f67) - Guillaume Boddaert
- gitignored key.json - (bc5cc82) - Guillaume Boddaert
- sync package.json version - (f211149) - Cog Bot
#### Style
- removed a glitch in TableEvent component - (680df32) - Guillaume Boddaert
#### Tests
- fixed event provider that imported a background singleton in the ui - (c7ec791) - Guillaume Boddaert

- - -

## 0.9.1 - 2025-03-11
#### Bug Fixes
- scrape an unknown event should not cause a failure in the hydrator anymore - (2444808) - Guillaume Boddaert
#### Continuous Integration
- release job will also upload main branch coverage - (0f5468c) - Guillaume Boddaert
#### Miscellaneous Chores
- **(deps)** bump framer-motion from 12.4.4 to 12.4.10 - (2932360) - dependabot[bot]
- **(deps)** bump @faker-js/faker from 9.5.1 to 9.6.0 - (8c6094d) - dependabot[bot]
- sync package.json version - (7205965) - Cog Bot

- - -

## 0.9.0 - 2025-03-09
#### Features
- added import / export ui - (396d177) - Guillaume Boddaert
#### Miscellaneous Chores
- import/export service - (9453ca9) - Guillaume Boddaert
- storage don’t use date type anymore - (12ba394) - Guillaume Boddaert
- added type guards for event entity and write dbo - (7e6e09a) - Guillaume Boddaert
- sync package.json version - (7c83d5f) - Cog Bot
#### Tests
- opportunisticly highen the coverage threshold - (43ff78c) - Guillaume Boddaert

- - -

## 0.8.0 - 2025-03-08
#### Continuous Integration
- codecov enabled on the project - (45a61f8) - Guillaume Boddaert
- ci will run coverage and upload reports - (55e3661) - Guillaume Boddaert
#### Features
- added layout to the routed pages - (1a190fe) - Guillaume Boddaert
#### Miscellaneous Chores
- added settings page - (7714c8c) - Guillaume Boddaert
- added settings provider - (b03de69) - Guillaume Boddaert
- enable react-router in main.html instead of event.html - (fc1f7de) - Guillaume Boddaert
- removed two unused dependencies - (e1196ac) - Guillaume Boddaert
- added event builder (and derivative sub-builders) - (792ae75) - Guillaume Boddaert
- sync package.json version - (cc1f463) - Cog Bot
#### Tests
- opportunisticly highen the coverage threshold - (bfeb363) - Guillaume Boddaert
- flaky test fixed in column.detector.test.ts - (c65e3b1) - Guillaume Boddaert
- tested text.ts - (c10fbdf) - Guillaume Boddaert
- tested crypto.ts - (a9950b2) - Guillaume Boddaert
- added coverage threshold to the project - (81a4748) - Guillaume Boddaert

- - -

## 0.7.1 - 2025-03-07
#### Bug Fixes
- per google request remove the used scripting and storage permissions from the project - (338933d) - Guillaume Boddaert
#### Continuous Integration
- attempt to make auto-approve work, with the help of mr gpt (2) - (131f220) - Guillaume Boddaert
#### Documentation
- Add GitHub issue templates for bug reports, feature requests, and tasks - (1a51c7f) - Guillaume Boddaert
#### Miscellaneous Chores
- **(deps)** bump @types/node from 22.13.4 to 22.13.9 - (4be0990) - dependabot[bot]
- **(deps)** bump nanoid from 3.3.8 to 3.3.9 in the npm_and_yarn group - (73ebfe8) - dependabot[bot]
- sync package.json version - (d6b2a67) - Cog Bot

- - -

## 0.7.0 - 2025-03-07
#### Bug Fixes
- fixed hydration of older records without players - (6c58795) - Guillaume Boddaert
#### Continuous Integration
- attempt to make auto-approve work, with the help of mr gpt - (7da79d5) - Guillaume Boddaert
#### Features
- complete support for setup (mapping, pairing, etc) - (4e7e2de) - Guillaume Boddaert
- spreadsheet column types should be almost correctly infered from data - (5f18988) - Guillaume Boddaert
- support for spreadsheet display and property overrides - (05b8734) - Guillaume Boddaert
#### Miscellaneous Chores
- reordered the setup screen through provider and dedicated components - (1cfd711) - Guillaume Boddaert
- sync package.json version - (644949c) - Cog Bot
#### Tests
- logger is considered background service if in node environment - (3b232e2) - Guillaume Boddaert

- - -

## 0.6.1 - 2025-03-06
#### Bug Fixes
- reverted changes on scrape button - (7db7a01) - Guillaume Boddaert
#### Miscellaneous Chores
- sync package.json version - (f17bc77) - Cog Bot

- - -

## 0.6.0 - 2025-03-01
#### Continuous Integration
- attempt to make auto-approve work (9) - (56ee17c) - Guillaume Boddaert
- attempt to make auto-approve work (8) - (615e736) - Guillaume Boddaert
- attempt to make auto-approve work (7) - (bf2eb40) - Guillaume Boddaert
- attempt to make auto-approve work (6) - (01d3010) - Guillaume Boddaert
- attempt to make auto-approve work (5) - (f780f6a) - Guillaume Boddaert
- attempt to make auto-approve work (4) - (f1ee666) - Guillaume Boddaert
- attempt to make auto-approve work (ter) - (ad75c62) - Guillaume Boddaert
- attempt to make auto-approve work (bis) - (652c103) - Guillaume Boddaert
#### Features
- players can now be edited - (6fe340d) - Guillaume Boddaert
#### Miscellaneous Chores
- entities use flat arrays, dbo use indexed objects - (3b86bc0) - Guillaume Boddaert
- sync package.json version - (5d413c9) - Cog Bot

- - -

## 0.5.0 - 2025-02-28
#### Continuous Integration
- attempt to make auto-approve work - (69fde62) - Guillaume Boddaert
- mark the project as BETA - (7e6ac75) - Guillaume Boddaert
- fix submit workflow (build on macos because issue on ubuntu-latest) - (cd519a4) - Guillaume Boddaert
- fix submit workflow (proper node version) - (1165f7c) - Guillaume Boddaert
- fix submit workflow - (1d13da9) - Guillaume Boddaert
- applied auto approve dependabot - (abe8435) - Guillaume Boddaert
#### Documentation
- added PRIVACY.md file - (6edb55e) - Guillaume Boddaert
#### Features
- event consultation and setup page - (2867fa5) - Guillaume Boddaert
#### Miscellaneous Chores
- gitignored stuff - (012de43) - Guillaume Boddaert
- gitignored stuff - (df2d425) - Guillaume Boddaert
- use of plasmohq/messaging - (960b0a8) - Guillaume Boddaert
- .gitignored ._* directories - (ae11ed0) - Guillaume Boddaert
- sync package.json version - (acc8009) - Cog Bot
#### Style
- changed project icons - (9340bde) - Guillaume Boddaert

- - -

## 0.4.0 - 2025-02-24
#### Features
- event list download button saves dao as a json file - (a0f89b4) - Guillaume Boddaert
#### Miscellaneous Chores
- sync package.json version - (48bdc25) - Cog Bot

- - -

## 0.3.0 - 2025-02-21
#### Bug Fixes
- eventlink-content used async method at root, moved inside an IFE - (cd355b3) - Guillaume Boddaert
#### Features
- added sidebar ( event status ico) added scrape button on agenda view - (3222448) - Guillaume Boddaert
#### Miscellaneous Chores
- applied a proper onion design for the project - (9c05978) - Guillaume Boddaert
- fixed typescript issues - (29f5e5d) - Guillaume Boddaert
- sync package.json version - (df7d118) - Guillaume Boddaert

- - -

## 0.2.0 - 2025-02-19
#### Bug Fixes
- README.md build status should be ok - (d00cf43) - Guillaume Boddaert
- added cog commit compliance as a CI job - (bb287aa) - Guillaume Boddaert
- attempted to fix release script - (cb46b69) - Guillaume Boddaert
- attempted to install PNPM correctly (again 2) - (b0d9b49) - Guillaume Boddaert
- attempted to install PNPM correctly (again)( - (667330d) - Guillaume Boddaert
- attempted to install PNPM correctly - (ebf78fb) - Guillaume Boddaert
- added missing pnpm dependency to the CI build - (40e74b1) - Guillaume Boddaert
#### Continuous Integration
- attempt to fix release script - (92506fa) - Guillaume Boddaert
- added a eslintrc file to relax coderefactor - (47061cc) - Guillaume Boddaert
- attempted to fix release action so that the version are pushed - (b3711cf) - Guillaume Boddaert
- attempted debug on GH_PAT secret - (40a9e9f) - Guillaume Boddaert
- fix dependabot autovalidation (with gh pat) - (6102205) - Guillaume Boddaert
- fix dependabot autovalidation - (9b214ef) - Guillaume Boddaert
- fix package.json is updated upon cog bump - (a0a5a77) - Guillaume Boddaert
- fix dependabot autovalidation - (c04f99a) - Guillaume Boddaert
- dependabot is automatically approved - (9f822b7) - Guillaume Boddaert
- added support for dependabot - (18bdaa5) - Guillaume Boddaert
- restored the ci workflow - (8703e78) - Guillaume Boddaert
- conventional commit check won’t bother checking before last tag - (f589497) - Guillaume Boddaert
- release job relies on cog to run tests - (e5dbaa7) - Guillaume Boddaert
- added cocogitto to release script - (7b656b5) - Guillaume Boddaert
- allow release.yml to be run manually - (ed0a2e1) - Guillaume Boddaert
- moving from changeset to cocogito - (6607475) - Guillaume Boddaert
#### Documentation
- fix the project refactorio badge - (a28a08e) - Guillaume Boddaert
- fix the project action status badge - (0ff007b) - Guillaume Boddaert
- added OpenSSF Best Practices id to the README.md - (bcda813) - Guillaume Boddaert
- added LICENSE file - (9b55610) - Guillaume Boddaert
- added a nice README.md - (61c1a77) - Guillaume Boddaert
- added more notes - (0a95d74) - Guillaume Boddaert
#### Features
- added indexDB storage for events - (f4f0773) - Guillaume Boddaert
- added logger - (7b16b22) - Guillaume Boddaert
- added storage support - (96f3910) - Guillaume Boddaert
- added a bad chatgpt logo - (1aa2e48) - Guillaume Boddaert
- complete tournament extraction that properly reaches all layers - (0d9ecd0) - Guillaume Boddaert
- request graphql proof of concept - (8dd8e6d) - Guillaume Boddaert
- initial commit - (2211be5) - Guillaume Boddaert
#### Miscellaneous Chores
- **(deps)** bump typescript from 5.3.3 to 5.7.3 - (ee40baa) - dependabot[bot]
- **(deps)** bump plasmo from 0.90.2 to 0.90.3 - (3ee63cf) - dependabot[bot]
- **(deps)** bump @types/chrome from 0.0.258 to 0.0.304 - (e2a84af) - dependabot[bot]
- **(deps)** bump @types/node from 20.11.5 to 22.13.4 - (85c7785) - dependabot[bot]
- **(version)** 0.1.1 - (0a6e3e9) - Guillaume Boddaert
- removed useless releaserc file since we use cog - (5d50369) - Guillaume Boddaert
- removed dependency to lodash - (2f14cf1) - Guillaume Boddaert
- use bowser for browser discovery instead of our own implementation - (58ed4ea) - Guillaume Boddaert
- added proper exception check in graphql client - (0107b38) - Guillaume Boddaert
- a sample set of hierarchized exceptions - (6febf43) - Guillaume Boddaert
- fixed some typing issues as reported by coderefactor - (59d5b50) - Guillaume Boddaert
- removed dependency to prettier, since we are biome based anyway - (3ad0c68) - Guillaume Boddaert
- added changeset as a dev dependency - (da86efb) - Guillaume Boddaert
- initialize changesets - (9ae9ed9) - Guillaume Boddaert
- package.json typed to module - (84b8e6e) - Guillaume Boddaert
- package.json amended to fit the project - (5b3f22b) - Guillaume Boddaert
- CI scripts - (b40ea45) - Guillaume Boddaert
- added husky and biome for linting at commit - (6ac47b0) - Guillaume Boddaert
- vitest instead of jest for test runner - (dab4b55) - Guillaume Boddaert
- merged messages related definition files - (f537cf3) - Guillaume Boddaert
- wip soon to be replaced by graphql variant - (b65542a) - Guillaume Boddaert
- working on stuff, all gpt - (749784c) - Guillaume Boddaert
- added pnpm lockfile to cvs - (aa396c1) - Guillaume Boddaert
- gitignored .idea directory - (9dc03d0) - Guillaume Boddaert
#### Tests
- added more test, on background.accessor.ts - (4487936) - Guillaume Boddaert
- added more test, on content.accessor.ts - (a88305c) - Guillaume Boddaert
- added a sample test - (cf45dd6) - Guillaume Boddaert

- - -

## 0.1.1 - 2025-02-16
#### Bug Fixes
- added cog commit compliance as a CI job - (78018e9) - Guillaume Boddaert

- - -

Changelog generated by [cocogitto](https://github.com/cocogitto/cocogitto).