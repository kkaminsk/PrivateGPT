# Capability: Theming

## Overview
PrivateGPT supports multiple visual themes to accommodate user preferences and accessibility needs. Themes are applied via CSS custom properties and can be switched without page reload.

## ADDED Requirements

### Requirement: Theme Selection
The application SHALL provide a theme selector dropdown in the header allowing users to choose between Default, Cyberpunk, and High Contrast themes.

#### Scenario: User switches to cyberpunk theme
- **Given** the application is running with default theme
- **When** the user selects "Cyberpunk" from the theme dropdown
- **Then** the application immediately applies cyberpunk colors (neon magenta/cyan accents)
- **And** no page reload occurs

#### Scenario: User switches to high contrast theme
- **Given** the application is running with any theme
- **When** the user selects "High Contrast" from the theme dropdown
- **Then** the application displays white background with black text
- **And** all borders are thick (2px+) and clearly visible
- **And** no gradients, transparency, or shadows are visible

#### Scenario: User returns to default theme
- **Given** the application is running with cyberpunk or high contrast theme
- **When** the user selects "Default" from the theme dropdown
- **Then** the application returns to the dark green theme

### Requirement: Theme Persistence (Session Only)
The application SHALL NOT persist theme preference across sessions. Theme selection MUST reset to default when the application is closed.

#### Scenario: Theme resets on application restart
- **Given** the user selected cyberpunk theme
- **When** the user closes and reopens the application
- **Then** the application starts with the default theme

### Requirement: High Contrast Accessibility
The high contrast theme SHALL meet WCAG 2.1 AA color contrast requirements with a minimum 4.5:1 ratio for all text.

#### Scenario: Color contrast compliance
- **Given** the high contrast theme is active
- **When** any text is displayed
- **Then** the text has a minimum contrast ratio of 4.5:1 against background

#### Scenario: Focus indicators visible
- **Given** the high contrast theme is active
- **When** any interactive element receives keyboard focus
- **Then** a clearly visible focus indicator is displayed
