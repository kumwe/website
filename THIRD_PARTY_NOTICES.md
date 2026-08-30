# Third-party notices

This file records the provenance and license notice for visual assets committed to this
repository. JavaScript package licenses are also reported by the package manager and are not
duplicated here.

## Earth surface textures

The following local files are metadata-stripped, WebP-encoded derivatives of example assets
distributed in
[`three-globe` 2.45.2](https://www.npmjs.com/package/three-globe/v/2.45.2):

| Local file                            | Upstream file                       | Transformation                                                  |
| ------------------------------------- | ----------------------------------- | --------------------------------------------------------------- |
| `public/textures/earth-day.webp`      | `example/img/earth-blue-marble.jpg` | Original 4096×2048 dimensions retained; metadata stripped; WebP |
| `public/textures/earth-night.webp`    | `example/img/earth-night.jpg`       | Original 4096×2048 dimensions retained; metadata stripped; WebP |
| `public/textures/earth-clouds.webp`   | `example/clouds/clouds.png`         | Resized from 4096×2048 to 2048×1024; alpha retained; WebP       |
| `public/textures/earth-topology.webp` | `example/img/earth-topology.png`    | Original 2048×1024 dimensions retained; metadata stripped; WebP |
| `public/textures/earth-water.webp`    | `example/img/earth-water.png`       | Original 1600×800 dimensions retained; metadata stripped; WebP  |

Upstream project: [vasturiano/three-globe](https://github.com/vasturiano/three-globe)

Package integrity (`three-globe@2.45.2`):
`sha512-3qJE2LAdyHsUPt02mgMRc+PG3j9kGEA0fUYrwKPGIVtvMR1XjDn9hCXu31AWocdgHOFcXkrRVz7jJZzTIvR0eQ==`

The upstream package supplies the following MIT License notice and no separate per-image notice.
It is reproduced here with the derived files.

> MIT License
>
> Copyright (c) 2019 Vasco Asturiano
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
> associated documentation files (the "Software"), to deal in the Software without restriction,
> including without limitation the rights to use, copy, modify, merge, publish, distribute,
> sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or
> substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
> BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
> NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
> DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Kumwe brand assets

`public/brand/kumwe-symbol.svg`, `public/brand/kumwe-wordmark.svg`, and `public/favicon.svg` are
first-party Kumwe brand assets copied unchanged from the canonical assets in `kumwe/app`. They are
not third-party assets. The Kumwe name and logos are not part of the Apache-2.0 code license.
