---
name: Sublime Craft Art
colors:
  surface: '#f8faf0'
  surface-dim: '#d9dbd1'
  surface-bright: '#f8faf0'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f5eb'
  surface-container: '#edefe5'
  surface-container-high: '#e7e9df'
  surface-container-highest: '#e1e3da'
  on-surface: '#191d17'
  on-surface-variant: '#444841'
  inverse-surface: '#2e312b'
  inverse-on-surface: '#f0f2e8'
  outline: '#757871'
  outline-variant: '#c5c7bf'
  surface-tint: '#586152'
  primary: '#172014'
  on-primary: '#ffffff'
  primary-container: '#2c3528'
  on-primary-container: '#949e8d'
  inverse-primary: '#c0cab7'
  secondary: '#54634c'
  on-secondary: '#ffffff'
  secondary-container: '#d4e5c8'
  on-secondary-container: '#586750'
  tertiary: '#172018'
  on-tertiary: '#ffffff'
  tertiary-container: '#2c352d'
  on-tertiary-container: '#949e93'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce6d3'
  primary-fixed-dim: '#c0cab7'
  on-primary-fixed: '#151e12'
  on-primary-fixed-variant: '#40493b'
  secondary-fixed: '#d7e8cb'
  secondary-fixed-dim: '#bbccb0'
  on-secondary-fixed: '#121f0d'
  on-secondary-fixed-variant: '#3c4b35'
  tertiary-fixed: '#dbe5d9'
  tertiary-fixed-dim: '#bfc9be'
  on-tertiary-fixed: '#151e16'
  on-tertiary-fixed-variant: '#404940'
  background: '#f8faf0'
  on-background: '#191d17'
  surface-variant: '#e1e3da'
  forest-mist: '#D2DCD0'
  sage-leaf: '#8C9C82'
  deep-moss: '#2C3528'
  ivory-surface: '#F8FAF0'
  placeholder: '#6B7A64'
typography:
  headline-xl:
    fontFamily: Nunito Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.08'
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Nunito Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Nunito Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  headline-lg-mobile:
    fontFamily: Nunito Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.3'
  lead:
    fontFamily: Nunito Sans
    fontSize: 24px
    fontWeight: '300'
    fontStyle: italic
    lineHeight: '1.3'
  body-lg:
    fontFamily: Nunito Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Nunito Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Nunito Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.43'
  label-md:
    fontFamily: Nunito Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Nunito Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.05em
  label-cta:
    fontFamily: Nunito Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.3333'
    letterSpacing: 0.16em
  label-xs:
    fontFamily: Nunito Sans
    fontSize: 10px
    fontWeight: '600'
    lineHeight: '1.2'
  chip-label:
    fontFamily: Nunito Sans
    fontSize: 12px
    fontWeight: '800'
    lineHeight: '1.0'
    letterSpacing: 0.05em
  label-eyebrow:
    fontFamily: Nunito Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  field: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  chip: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-safe: 32px
  section-gap: 80px
  container-max: 1200px
---

## Brand & Style

The brand personality is defined by botanical sophistication and the "mimo y delicadeza" (care and delicacy) of handmade artistry. It targets a high-end audience that appreciates the slow-craft movement, natural materials, and meticulous detail. The UI must evoke a serene, organic emotional response, acting as a quiet, premium gallery for artisanal works.

The design style is **Botanical Minimalism**. It draws from natural textures and an airy layout to create a high-end editorial feel. By combining expansive whitespace (Natural Ivory) with deep, forest-inspired tones, the system creates a sense of luxury that feels grounded and authentic rather than industrial.

## Colors

The palette is a transition from earthen depths to airy surfaces. **Natural Ivory** is the foundational surface color, providing a warmer, more sophisticated alternative to pure white that feels like handmade paper.

**Dark Green** (Deep Moss) serves as the primary brand color, used for high-contrast typography and call-to-action elements to ground the design. **Sage Green** and **Forest Green** act as secondary and tertiary accents, used for decorative elements, subtle backgrounds, and state indications. This monochromatic green range ensures a cohesive, calming botanical atmosphere.

## Typography

The system uses a **single typeface, Nunito Sans**, across headlines, body copy and functional labels. Its humanist, low-contrast letterforms carry the "artesanía" spirit without the formality of a serif, and the variable weight range (Light to ExtraBold) supplies all the hierarchy the layout needs from one font request. There is no serif family: a serif heading rule anywhere in the codebase is a defect.

Hierarchy comes from weight and size, not from mixing families: headlines use Bold (700) at 48px and SemiBold (600) at 32/28/24px with slightly negative tracking; lead paragraphs use Light (300) italic at 24px; body copy uses Regular (400) at 18/16/14px; and labels use SemiBold (600) at 12-14px. For a more curated feel, use the `label-sm` style in all-caps for categories, tags and small accents — with `label-cta` tracking (0.16em) on button labels and `label-eyebrow` tracking (0.1em) on section eyebrows.

## Layout & Spacing

This design system utilizes a **Fixed Grid** model for desktop environments, centered with a maximum width of 1200px. The spacing rhythm is intentionally "airy" to reflect the "delicadeza" of the brand.

Large vertical gaps (section-gap) are used between content blocks to allow the eye to rest, mimicking a physical art book layout. On mobile, the system shifts to a fluid 4-column grid with 16px margins, ensuring that product photography maintains its impact even on smaller screens.

## Elevation & Depth

Hierarchy is primarily conveyed through **Tonal Layers** rather than shadows. Elements at a higher elevation use subtle shifts in green saturation (e.g., a Forest Green background for a secondary section) or use a pure white background to "pop" against the Natural Ivory surface.

When physical depth is required for interactive components like modals, use a **Low-Contrast Outline** combined with a tinted ambient shadow. The shadow should use a Dark Green tint at very low opacity (`rgba(44, 53, 40, 0.04)`) to maintain the botanical warmth of the system.

## Shapes

The shape language is **Soft**, with a base radius of 4px. This choice provides a gentle touch that aligns with the brand's "mimo" (care) theme without appearing too playful or informal. Interactive controls — buttons, inputs, selects, text areas and callouts — use the tighter `rounded-field` (2px) to read as precise and functional, while filter chips use `rounded-chip` (12px) and larger containers like product cards use `rounded-lg` (8px) to emphasize their role as distinct, cradled objects within the layout.

## Components

- **Buttons:** Primary buttons are solid Dark Green (#2C3528) with white text (`on-primary`), `rounded-field` (2px) corners and a 12px uppercase label with `label-cta` tracking and a 16px line box, which gives the 44px height of the node. Their hover state softens the fill with a slight opacity reduction (90%), not a hue change: shifting to Sage Green would drop the label below the AA contrast ratio. Secondary buttons keep the same shape and label, with a 1px Dark Green (`deep-moss`) border and transparent background.
- **Input Fields:** White fill with a full 1px `outline` (#757871) border and `rounded-field` (2px) corners. Text is 14px (`body-sm`) and the placeholder uses the `placeholder` color (#6B7A64). Both values are darker than the Figma source on purpose: the original #E2E8DF border gave 1.25:1 and the translucent placeholder 2.02:1, short of the 3:1 that SC 1.4.11 asks of a control boundary and the 4.5:1 of body text. Focus adds the shared 2px `primary` ring with a 2px offset, so it never depends on colour alone. Labels should be small, uppercase, and positioned above the field.
- **Cards:** Product cards should use a pure white background or a Forest Green (#D2DCD0) fill to create a soft distinction from the Ivory surface. They should have no border, relying on the subtle color shift for definition.
- **Chips & Tags:** Soft 12px-radius pills (`rounded-chip`) 24px tall with a 12px uppercase ExtraBold label (`chip-label`). Selected chips use a Dark Green fill with white text; unselected chips use a muted surface fill with Dark Green text. Both states carry a 1px border — `outline` when unselected, the fill colour itself when selected — because the unselected fill alone gives 1.04:1 against the page and left the control invisible. These highlight material types or craft techniques.
- **Callouts:** Muted surface fill, a 4px Dark Green left border, `rounded-field` corners and 14px italic text, used for process advisories.
- **Navigation:** A clean, top-aligned header. When scrolled, it should take on the Natural Ivory color with a 90% opacity and a subtle backdrop blur.
- **Iconography:** Use fine-line icons (1px stroke) in Dark Green to match the delicate, low-contrast letterforms of the typography.
