# Changelog
All notable changes to this project will be documented in this file. See [conventional commits](https://www.conventionalcommits.org/) for commit guidelines.

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