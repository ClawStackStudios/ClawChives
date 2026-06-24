# 🔌 ClawChives Server Boundary API Contract (v1.0)

This document formalizes the validation mechanics, routing fallbacks, and diagnostic responsibilities between the **ClawChives Mobile Client** and the **ClawChives Web Server**. Ensuring a harmonious operation requires rigid state synchronization and validation.

## 🔗 The Versioned API Contract
All communication between the Android Client and the Web Server explicitly communicates backend requirements via `ktor-client`. 

### Boundary Definitions

- **Versioning Protocol**: The mobile application injects stateless `X-Client-Version: 1.0` and `Accept-Version: 1.0` headers on every outward request to explicitly communicate the client's protocol capability level.
- **Stateless Communication**: Aside from an initial token handshake, the client communicates purely statelessly via `Authorization: Bearer <sessionToken>`.

---

## 🔀 Bidirectional Transformation & Graceful Fallbacks

Both systems exist asynchronously, meaning that one side may update its schema before the other.

- **HTTP Serializers**:  
  Configured to safely swallow unknown JSON properties from future server changes (`ignoreUnknownKeys = true`).
  
- **Outbound DTO Sanitization**:  
  Outbound DTOs undergo strict `.sanitize()` transformations to normalize text structures and resolve explicit nulls before they ever hit the wire.

- **State Synchronization**:  
  Network DTO structures strictly mirror the recent web server schema, ensuring properties like `archived` are accurately mapped to keep local state mutations in perfect parity.

---

## 📂 Folder (Pod) Operations & State Invariants

To ensure parity between the Web Client and the Mobile Application, Folder management must adhere strictly to the following rules:

1. **DTO Sanitization & Color Resolution**: Both `FolderCreateRequest` and `FolderUpdateRequest` must explicitly sanitize inputs. If a folder color hex code is invalid, empty, or `null`, the mobile UI must gracefully fall back to the semantic `CyanAccent` without throwing parsing errors.
2. **The Deletion Invariant (Cascading Unassociation)**: Invoking `DELETE /api/folders/:id` on the server destroys the folder but does **not** delete the pinchmarks inside it. Instead, the server unassociates them (`folder_id = null`). The mobile client's local state must immediately mirror this cascading effect—orphaning the pinchmarks to the general pool—without requiring a full re-fetch of the database.
3. **Complete API Parity**: The mobile client must fully map `POST /api/folders`, `PUT /api/folders/:id`, and `DELETE /api/folders/:id` to maintain true operational symmetry with the Web Client.

---

## 🏷️ Tag Operations & State Invariants

Until Phase 11 (Tag System Architectural Refactoring) is completed, Tags must be treated by the mobile client according to the following strict topology:

1. **Stateless Tag Mapping (Virtual Existence):** The server does not maintain a separate `tags` database table. The endpoint `GET /api/bookmarks/tags` uses SQLite `json_each(tags)` to dynamically generate distinct tag strings from the existing pinchmarks. The mobile client must expect a primitive array of strings (`List<String>`), not complex DTOs, and must not enforce local UUID generation or independent table constraints for tags.
2. **Implicit Tag Pruning (Garbage Collection):** Because tags are dynamically generated, there is no `DELETE /api/tags/:tag` endpoint. If a tag is removed from all local pinchmarks (or all pinchmarks holding it are deleted), the mobile application's local state must mirror the server's implicit deletion mechanic by orphaning and pruning the tag dynamically from UI filters.
3. **Sanitization Invariant:** When creating or updating a pinchmark (`PUT /api/bookmarks/:id`), the mobile app must strictly `.trim()` all strings in the tag array to prevent ghost duplicate tags (e.g., `"tag "` vs `"tag"`) that would splinter the `json_each` groupings on the server.

---

## 🛡️ Authentication and Authorization Invariants

To keep the client lightweight, it must not maintain long-running credentials inside raw memory variables. Authentication boundaries follow these strict rules:

1. **Client-side Hash**: The plaintext `hu-` human key never crosses the boundaries. It is locally `SHA-256` hashed using `ClawCrypto` on the app side.
2. **Ephemeral Exchange**: The server boundaries answer the key with a `Bearer` API Session Key (`api-`).
3. **Persisted Key**: The actual master key is only saved entirely locally on the device's hardware-backed Encrypted SharedPreferences if requested by the user. 
4. **Compatibility Check**: Any update to the `POST /api/auth/token` system must ensure backwards-compatibility payload properties indefinitely.

---

## 🔄 Automated Consistency Testing

Every local modification concerning API requests or state syncing is validated against our `MockEngine` integration testing matrix (`testDebugUnitTest`). The automated tests confirm state consistency and verify:
- The JSON parser gracefully handles omitted historical arrays and ignores non-existent future keys without throwing runtime exceptions.
- Explicit Version contract headers are strictly set.

_See: `app/src/test/java/com/example/data/remote/StateBoundaryIntegrationTest.kt`_

---

## 🎨 UI/UX Theme Mechanics (Liquid Metal)

To maintain true essence parity between the Web Dashboard and the Mobile Client, the Android app must seamlessly implement the **"Liquid Metal"** theme transition mechanism.

1. **Circular Reveal Animation**: 
   When the user toggles the theme in the Settings Menu, the transition must perform a circular reveal originating from the tap coordinates. The underlying UI state swaps beneath the expanding circle mask, identical to the web client's View Transitions implementation.
2. **Theme-Aware Text Synthesis**: 
   All typography within the Settings Menu (and globally) must strictly adhere to theme-aware text resolving. When the theme is toggled, text colors (cyan, slate, headers) must swap instantly and fluidly, avoiding the "gray-out" flash common in poor Android theme implementations.

---
Maintained by CrustAgent©™
