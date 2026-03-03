# Smart Campus Connect

## Current State

- Dashboard shows stat cards pulling from `getStats()` which returns real backend counts (studyPostCount, doubtCount, eventCount, announcementCount, userCount). Stats are live and correct -- no hardcoded values exist in the frontend.
- Students page uses `useGetKnownUsers` which discovers principals ONLY from study posts, doubts, and non-DM chat messages, then fetches their profiles. Students who registered but haven't posted or chatted are invisible.
- Chat Group tab filters out DM messages correctly. However, users who only send DMs (no group chat or posts) are not discoverable in the Students page or the New Message dialog.
- The backend `registerUser()` creates placeholder profiles with empty displayName. These show in userCount stats but not in Students list because they have no activity to link to.
- No backend function exists to retrieve all registered users directly.

## Requested Changes (Diff)

### Add
- Backend: `getAllUsers()` query that returns all principals and profiles stored in `userProfiles` map, excluding users with empty displayName (not yet set up).
- Backend: `getAllUserProfiles()` returning `[(Principal, UserProfile)]` so the frontend can discover all students who have set a display name.
- Frontend: `useGetAllStudents` hook that calls `getAllUserProfiles()` instead of deriving users from activity.
- Frontend: Stats cards on Dashboard already pull from `getStats()` -- confirm they reflect real-time data with no hardcoded fallbacks.

### Modify
- Backend: `registerUser()` -- already correct, no change needed.
- Backend: Add `getAllUserProfiles` public query function returning all profiles with non-empty displayName.
- Frontend `useGetKnownUsers` -- replace activity-based discovery with direct `getAllUserProfiles()` call so ALL students with a set display name appear, regardless of activity.
- Frontend `StudentsPage` -- same, now shows all students with display names set.
- Frontend `ChatPage` NewMessageDialog -- uses `useGetKnownUsers` which will now show all students.
- Frontend `useGetStats` -- already reads from backend `getStats()`, no change needed. Confirm no hardcoded stat overrides anywhere.
- Dashboard StatCard -- already shows real values from `getStats()`. Remove any "500+" or hardcoded display values if they exist (none found in current code -- already live).

### Remove
- Activity-based principal discovery loop in `useGetKnownUsers` (replaced by direct getAllUserProfiles call).

## Implementation Plan

1. **Backend**: Add `getAllUserProfiles` public query function in `main.mo` that returns an array of `{principal: Principal; profile: UserProfile}` records, filtering out entries with empty displayName.
2. **Frontend**: Update `backend.d.ts` to declare the new `getAllUserProfiles` function signature returning `Array<{principal: Principal; profile: UserProfile}>`.
3. **Frontend**: Rewrite `useGetKnownUsers` in `useQueries.ts` to call `actor.getAllUserProfiles()` directly, mapping results to `KnownUser[]`, excluding the current user's own principal.
4. **Frontend**: Add `staleTime: 60_000` and `refetchInterval: 30_000` to `useGetKnownUsers` so the student list refreshes automatically as new students register.
5. **Frontend**: Update `StudentsPage` and `ChatPage` -- no direct changes needed as they already consume `useGetKnownUsers`, but verify empty state messages are accurate.
6. **Frontend**: Confirm `useGetStats` refetches on mutations that change userCount (already done via `invalidateQueries` in `useSaveProfileWithUsername`).
