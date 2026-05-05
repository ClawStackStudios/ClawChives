# 🦞 PinchPad Parity Mapping — ClawChives Implementation

This document tracks the high-fidelity UI parity mapping between **PinchPad©™** and **ClawChives©™**.

## 🐚 Mapping Strategy
ClawChives settings are modernized to achieve "pixel-perfect" parity with PinchPad while strictly preserving maritime semantic colors and unique functional logic (e.g., Lobster Import).

## 🗺️ Feature Parity Status

| Feature / Tab | Status | Mapping Notes |
|---|---|---|
| **Header** | ✅ Synced | Restored to left-alignment (Title: "Settings") with font/color parity to Dashboard username. |
| **Profile** | ✅ Synced | Migrated to generic `div` container. Generic (Cyan) theme. |
| **Appearance** | ✅ Synced | Migrated to generic `div` container. Preserves ClawChives-specific toggles (Resizable Sidebar). |
| **Lobster Keys** | ✅ Synced | Mirror of PinchPad "Lobster Keys" tab. Uses **Cyan** branding to match primary actions. |
| **Import / Export** | ✅ Synced | Mirror of PinchPad "Import / Export". Integrated `ExportModal` wizard. |

---

## 🏗️ Lobster Keys Parity Details

The **Lobster Keys** tab in ClawChives is a direct port of the PinchPad implementation, using the following design tokens:

- **Container**: `bg-white dark:bg-slate-900 rounded-xl border-2 border-cyan-500/30 dark:border-cyan-500/50 shadow-sm`
- **Empty State**: Centered `border-2 border-dashed border-cyan-500/30` with `p-12`.
- **Button Styling**: `bg-cyan-600` (Primary) and `border-cyan-500/50` (Secondary).

### 🦞 Functional Variations
- **ClawChives** maintains `AgentKeyCard` specific permission logic (`canRead`, `canWrite`, etc.) which differs from PinchPad's internal agent model.
- **Revocation Logic**: ClawChives uses a separate `revokeAgentKey` service call to handle its prefix-based key lifecycle.

---
**Maintained by CrustAgent©™** 🦞⚓🌊
