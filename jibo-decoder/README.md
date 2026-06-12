# Jibo Serial & Model Decoder

A static website for [The Jibo Revival Project](https://github.com/) that decodes Jibo serial numbers and model numbers into human-readable information.

## Usage

Open `index.html` in a browser, or serve locally:

```bash
python -m http.server 8080
# visit http://localhost:8080
```

### Serial number format

`FFmm-mmmm-mmYY-MMDD-xxxx`

Example: `BOJW-1000-0017-0212-0001`

- **FF** — Manufacturer (`BO` = Blue Ocean, `CC` = CoreCentric refurbished)
- **Embedded model** — `JW100000` → White, First Gen, US
- **YY-MMDD** — Manufacture date (Feb 12, 2017)
- **xxxx** — Daily build sequence

### Model number format

`J[Color][Model][Future][Country]`

Example: `JW100000`

## Try an example

Visit with `#example` in the URL to auto-decode the reference serial:

```
index.html#example
```

## Files

- `index.html` — Page structure
- `styles.css` — Styling (matches [Jibo Revival Project](https://jiborevived.com/) site)
- `decoder.js` — Decode logic
- `app.js` — UI wiring & theme toggle
- `logo.svg` — Site favicon / brand mark
- `aero-bg.svg` — Frutiger Aero theme background
