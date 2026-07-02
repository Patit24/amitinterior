# Interior Amit Firebase Admin Setup

This project now has a Firebase-powered admin panel at:

```text
/admin/
```

The public site still works without Firebase. Once Firebase is configured, these pages automatically use live content:

- `/portfolio/` reads `portfolioItems`
- `/services/` reads `services`

## 1. Create Firebase project

1. Go to Firebase Console.
2. Create a project.
3. Add a Web App.
4. Copy the Firebase config values.

## 2. Enable Firebase products

Enable:

- Authentication → Sign-in method → Email/Password
- Firestore Database
- Storage

## 3. Add local environment values

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Fill:

```text
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Then run:

```bash
npm run dev -- --host 127.0.0.1 --port 5174
```

Open:

```text
http://127.0.0.1:5174/admin/
```

## 4. Create first admin user

In `/admin/`:

1. Enter `interioramit26@gmail.com` and your password.
2. Tick “Create first admin account”.
3. Submit once.
4. Untick it for normal sign-in afterward.

The admin panel is intentionally locked to this one email address.

## 5. Add GitHub repository secrets

For live GitHub Pages admin, add these repository secrets:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

GitHub → repository → Settings → Secrets and variables → Actions → New repository secret.

Then push to `main`; GitHub Actions rebuilds the live site.

## 6. Security rules

Use the included starter files:

- `firestore.rules`
- `storage.rules`

Important: publish both rules files in Firebase Console. They are already locked to `interioramit26@gmail.com`.
