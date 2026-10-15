# JobTracker mobile

Expo SDK 57, React Native and Expo Router. The active application lives in `src/app/`.
The original `app/` template is retained but Expo Router prefers `src/app/`.

## Features

- Dashboard: prioritized Next Action, six summary counts and recorded schedule.
- Applications: create, view, edit, delete with confirmation; all nine statuses;
  company/role search, active/archive/attention filters, status and sorting.
- All web fields: method, contact, follow-up preference, dates, location, source,
  URL, salary, personal notes and separate job description with cleanup/undo.
- Timeline: application sent, follow-up, recruiter reply, interview, assignment,
  submission and offer. Automatic events and workflow transitions come from API.
- Schedule: overdue/today/upcoming commitments separate from suggested attention.
- Insights: current stages, status breakdown, suggestions and saved context.
- Settings: persisted system/light/dark appearance, account and sign-out.
- Clerk authentication, secure native session storage, per-session query caches,
  token renewal, signed-in API calls, pull-to-refresh and foreground refresh.
- Failed saves retain drafts; leaving edited forms asks before discarding.

Native login uses Clerk hosted authentication so all enabled sign-in methods remain
available in Expo Go. Web preview uses Clerk's embedded SignIn. No mock data or
authentication bypass is used. Native API must be enabled in the same Clerk app.

## Start

Copy `.env.example` to `.env.local` and set the same public Clerk key and API URL
as the web app. The phone must reach the API; `localhost` means the phone itself.
Use the production HTTPS API or a reachable development host. Never put backend
secrets in `EXPO_PUBLIC_*` variables.

On a physical device in LAN development, a configured localhost API is resolved
to the Expo development computer's LAN IP. Run the backend listening on
`http://0.0.0.0:5080`; keep the phone on the same network. An Expo tunnel only
forwards the app bundle, so a tunneled session needs an explicitly reachable API.
For the local browser preview, run the API with `FrontendUrl=http://localhost:5173`
to allow that exact origin. Native apps do not use browser CORS.

The production API already allows `http://localhost:5173`. Use port 5173 for
a production-connected browser preview. If another web development server is
using that port, stop it first or use Expo Go, where browser CORS does not apply.
`start-mobile.ps1` starts the app on that port with the Windows certificate store.

```
npm install
npm run start -- --lan --port 5173
npm run web
```

Scan the displayed QR code with an SDK-57-compatible Expo Go. If your network
blocks LAN access, `npm run start -- --tunnel` creates an Expo tunnel.

## Check and build

```
npm run typecheck
npm run lint
npm run test
npm run build
npx expo-doctor
```

Pure domain utilities are copied from web with only the MUI color type replaced.
The parity test fails if web changes without updating mobile. Keep both aligned.
No API schema changes or database migration are needed.

For an installable Android APK, sign in to the owner's Expo account and run:

```
npx eas-cli@latest build --platform android --profile preview
```

`eas.json` also includes a production profile. EAS needs an owner/project and
signing credentials; store submission additionally needs developer accounts.
The bundle/package identifier is `fi.rikulahdeaho.jobtracker`. Register it in
Clerk Native applications before a production build. EAS is not configured to
submit automatically. Exporting bundles is not equivalent to a signed device build.

Future profile/tracking/export controls are unavailable, matching the web app.
No background notifications, calendar sync or manual reminder CRUD is added.
