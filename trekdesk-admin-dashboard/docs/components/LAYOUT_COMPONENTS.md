# Layout Component Reference

These components wire the visual shell of the dashboard together. They live in `src/components/` (not `ui/`, as they are application-specific, not reusable primitives).

---

## Header

**File:** `src/components/Header.tsx`

The sticky top bar of the dashboard layout. Always visible above the page content.

### Responsibilities

- **Search bar** — global search placeholder (`TODO:` hook up to search API)
- **Notification bell** — icon with a red badge dot (static, not yet functional)
- **Profile area** — shows tenant name + account type; avatar circle

### Behavior

- When the sidebar is **closed** (`isSidebarOpen: false`), a **hamburger menu button** (☰) is revealed that calls `toggleSidebar()` from `useUIStore`.
- When the sidebar is **open**, the hamburger button is hidden (the sidebar has its own collapse control).

### State Dependencies

| State           | Source       | Usage                                      |
| --------------- | ------------ | ------------------------------------------ |
| `isSidebarOpen` | `useUIStore` | Conditionally renders the hamburger button |
| `toggleSidebar` | `useUIStore` | Called by the hamburger button             |

### Layout

The Header renders as a `<header>` with:

- `position: sticky; top: 0` — stays visible on scroll
- `backdrop-filter: blur(8px)` — glassmorphism blur over page content
- `z-index: 90` — sits above page content, below modals (z-index 100+)

---

## Sidebar

**File:** `src/components/Sidebar.tsx`

The main navigation panel on the left side of the dashboard.

### Responsibilities

- Navigation links for all dashboard sections
- Visual indication of the active route
- Collapse/expand control (synced with `useUIStore`)
- Tenant branding section at the top
- Logout button at the bottom (calls `AuthContext.logout()`)

### Navigation Items

| Label          | Route            | Icon          |
| -------------- | ---------------- | ------------- |
| Overview       | `/`              | BarChart3     |
| Conversations  | `/conversations` | MessageSquare |
| AI Persona     | `/persona`       | Brain         |
| Knowledge Base | `/knowledge`     | BookOpen      |
| Widget Config  | `/widget`        | Settings      |

### State Dependencies

| State            | Source                       | Usage                             |
| ---------------- | ---------------------------- | --------------------------------- |
| `isSidebarOpen`  | `useUIStore`                 | Show/hide the sidebar panel       |
| `toggleSidebar`  | `useUIStore`                 | Called by the collapse button (×) |
| `logout`         | `useAuth()`                  | Called when user clicks Logout    |
| Current location | `useLocation()` React Router | Active link highlighting          |

### Active Link Detection

```tsx
const isActive = (path: string) => {
  if (path === "/") return location.pathname === "/";
  return location.pathname.startsWith(path);
};
```

---

## ProtectedRoute

**File:** `src/components/ProtectedRoute.tsx`

A security wrapper component. Ensures only authenticated users can access the dashboard routes.

### Props

| Prop       | Type              | Description                          |
| ---------- | ----------------- | ------------------------------------ |
| `children` | `React.ReactNode` | The protected page content to render |

### Render Logic

```
ProtectedRoute
  ├── user=null && loading=true  → Full-screen spinner (auth check in progress)
  ├── user=null && loading=false → <Navigate to="/login" state={{ from: location }} replace />
  └── user set                  → <>{children}</>
```

The `state={{ from: location }}` on the redirect preserves the original URL so `Login.tsx` can redirect the user back to where they were trying to go after a successful login.

### Where It's Used

In `App.tsx`, the entire `/*` route tree is wrapped:

```tsx
<Route
  path="/*"
  element={
    <ProtectedRoute>
      <Layout>...</Layout>
    </ProtectedRoute>
  }
/>
```

### State Dependencies

| State      | Source          | Usage                                            |
| ---------- | --------------- | ------------------------------------------------ |
| `user`     | `useAuth()`     | Determines if user is authenticated              |
| `loading`  | `useAuth()`     | Prevents premature redirect during session check |
| `location` | `useLocation()` | Passed to login redirect state                   |
