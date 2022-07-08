### [1.5.6](https://github.com/Konecty/konecty-sdk/compare/1.5.5...1.5.6) (2022-07-08)


### 🛠 Fixes

* fix __updatedAt typo ([be792ed](https://github.com/Konecty/konecty-sdk/commit/be792ed3e05e36ee4207bc7e75b09e8ed589a45c))

### [1.5.5](https://github.com/Konecty/konecty-sdk/compare/1.5.4...1.5.5) (2022-06-09)


### 🧪 Tests

* update test fixtures ([d35d8e0](https://github.com/Konecty/konecty-sdk/commit/d35d8e03f351b2b4c4fe7e0e45604727e6472315))


### 🛠 Fixes

* remove filter fields from FilterCondition to stop circular reference ([cb4de27](https://github.com/Konecty/konecty-sdk/commit/cb4de27d3c80ac0af2c855c7f8cd3b882b037afb))
* xor value & valueField on MetadataConditionFields ([cdfb9cf](https://github.com/Konecty/konecty-sdk/commit/cdfb9cf014abc04a91249d3ba4a4c6134d11a92b))

### [1.5.4](https://github.com/Konecty/konecty-sdk/compare/1.5.3...1.5.4) (2022-06-09)


### 🛠 Fixes

* add missing types in FieldOperators ([a279c14](https://github.com/Konecty/konecty-sdk/commit/a279c14235aff56c32a83efada4c973c1df16ed7))

### [1.5.3](https://github.com/Konecty/konecty-sdk/compare/1.5.2...1.5.3) (2022-06-08)


### 🛠 Fixes

* add TypeUtils exports ([be28fb8](https://github.com/Konecty/konecty-sdk/commit/be28fb8bd18aff5ad89283fb37a110e81ce50f0b))

### [1.5.2](https://github.com/Konecty/konecty-sdk/compare/1.5.1...1.5.2) (2022-06-08)


### 🛠 Fixes

* module export ([c7395b6](https://github.com/Konecty/konecty-sdk/commit/c7395b6654313b5e5b2f8dad6e8098cb6ca11c62))
* types export ([f67459a](https://github.com/Konecty/konecty-sdk/commit/f67459a00664ce128a0bc8ce3e3a6a228d07f205))

### [1.5.1](https://github.com/Konecty/konecty-sdk/compare/1.5.0...1.5.1) (2022-06-08)


### 🛠 Fixes

* use quotes on field names 'cause of invalid characteres ([8476162](https://github.com/Konecty/konecty-sdk/commit/847616259fd34354c9a6af7700b4df360d651f76))

## [1.5.0](https://github.com/Konecty/konecty-sdk/compare/1.4.0...1.5.0) (2022-06-06)


### 🚀 Features

* export metadata command ([8bc81e9](https://github.com/Konecty/konecty-sdk/commit/8bc81e97e79515683b719b44cc799d18912efda5))

## [1.4.0](https://github.com/Konecty/konecty-sdk/compare/1.3.0...1.4.0) (2022-06-03)


### :scissors: Refactor

* extract getHomeDir ([952280f](https://github.com/Konecty/konecty-sdk/commit/952280fbed7e602cee7ba3ce47bd0c6fffcb810e))


### 🧪 Tests

* fix path and fs mocks ([ca71e37](https://github.com/Konecty/konecty-sdk/commit/ca71e37b7dd2aab1330cac1abcb0f1f0697ef359))


### 🚀 Features

* add config file load to konecty client ([a6ef8a5](https://github.com/Konecty/konecty-sdk/commit/a6ef8a543db60793aebeedacfb8ea6cbb0b000d2))
* konecty cli login ([98479bb](https://github.com/Konecty/konecty-sdk/commit/98479bbb83a3d3ca1b5b75b2a3f0176e52510b02))


### Other

* merge branch 'main' into feat/konecty-login ([8e19680](https://github.com/Konecty/konecty-sdk/commit/8e19680883468be4e6f5e6f1e1a4daa8f7869d50))

## [1.3.0](https://github.com/Konecty/konecty-sdk/compare/1.2.0...1.3.0) (2022-06-02)


### 🦊 CI/CD

* remove dist from codebase ([a6c55f9](https://github.com/Konecty/konecty-sdk/commit/a6c55f9b318bdf863e66ed1fc070962c61577716))


### 🚀 Features

* delete document ([f504253](https://github.com/Konecty/konecty-sdk/commit/f504253f2da2c858aa2d02b2db0301f0796251a3))
* document create ([04aa667](https://github.com/Konecty/konecty-sdk/commit/04aa667fa4e902b20583b1d3303d58aee84fad95))
* document required fields validation ([4ad9b18](https://github.com/Konecty/konecty-sdk/commit/4ad9b187494f036dacd0e9230e5991543d3f6d85))
* update document ([db3f351](https://github.com/Konecty/konecty-sdk/commit/db3f351e66eb9f6b850d8d6d9be6f263688d1627))


### 🛠 Fixes

* fix base modules definitions ([a8aadf0](https://github.com/Konecty/konecty-sdk/commit/a8aadf00bc32b1f44b99e34e68e7f7847483d51b))

## [1.2.0](https://github.com/Konecty/konecty-sdk/compare/1.1.0...1.2.0) (2022-06-01)


### :scissors: Refactor

* change base objects type ([9f09be9](https://github.com/Konecty/konecty-sdk/commit/9f09be96a7256072c07c5d992448b7ac116fd31a))
* change module signature ([83ff9d5](https://github.com/Konecty/konecty-sdk/commit/83ff9d5f783d596e6c0c17aa8ba5baba0a0a64fb))
* remove any type from param ([046dd01](https://github.com/Konecty/konecty-sdk/commit/046dd0182b84a1ba0339bbdadd4e8263067fb17a))
* remove dead code ([a4abe16](https://github.com/Konecty/konecty-sdk/commit/a4abe167c1288ad6d2afd1b2342035352f827fec))
* rename Document class ([b1588d3](https://github.com/Konecty/konecty-sdk/commit/b1588d3a711d840adb3bf0014862e58ead455acd))
* rename Filter to KonectyFilter ([fe6a969](https://github.com/Konecty/konecty-sdk/commit/fe6a969ec331aa1b54e06f1d721fc59d82ba5ada))


### 🦊 CI/CD

* fix delete wrong file ([55b3696](https://github.com/Konecty/konecty-sdk/commit/55b36962e34641a9afb387ac3732b593d0245bcf))


### 🚀 Features

* add filter type ([a4e1431](https://github.com/Konecty/konecty-sdk/commit/a4e14315987a81eefac182b19ca7743ec7243f1c))
* create module and type from metadata ([c0192b3](https://github.com/Konecty/konecty-sdk/commit/c0192b3a892604d976f285cbf2a688f5dd075a9c))
* konecty module find methods ([ab79e94](https://github.com/Konecty/konecty-sdk/commit/ab79e94d0456d67e1bc8ba2f67aaa1845ed7b53b))


### 🛠 Fixes

* filter data type ([abb64e9](https://github.com/Konecty/konecty-sdk/commit/abb64e94779f961d45f60a95cba01add9c5bf6c9))
* filter type ([01ae88e](https://github.com/Konecty/konecty-sdk/commit/01ae88e5c3f6fce32e6fc0cb9d5dcfb2e5768f9a))
* lodash dependecy ([656d20b](https://github.com/Konecty/konecty-sdk/commit/656d20b695da351f5a884df805d16c75e559bca1))
* metadata modules generation ([512028d](https://github.com/Konecty/konecty-sdk/commit/512028d7d4ef9165620565193a8a324adc890e30))

## [1.1.0](https://github.com/Konecty/konecty-sdk/compare/1.0.1...1.1.0) (2022-05-26)


### 🧪 Tests

* refactor test to accept br tag with closing tag ([f487be5](https://github.com/Konecty/konecty-sdk/commit/f487be53f747af68af2f8b4adb6b29cf08b12f8e))


### 🚀 Features

* add support for npm ([280f29f](https://github.com/Konecty/konecty-sdk/commit/280f29f7a2af2d73eee18723c9a877444ce0ac30))


### 🛠 Fixes

* add closing tag for the br ([14fdebf](https://github.com/Konecty/konecty-sdk/commit/14fdebf2982d388ecd6255d3bfd8605053d32095))

### [1.0.1](https://github.com/Konecty/konecty-sdk/compare/1.0.0...1.0.1) (2022-05-25)


### 🛠 Fixes

* resolved paths fix ([90558e2](https://github.com/Konecty/konecty-sdk/commit/90558e247dadcb9d9f1ceab58515fbd3783aa5e4))

## [1.0.0](https://github.com/Konecty/konecty-sdk/compare/...1.0.0) (2022-05-25)


### :scissors: Refactor

* remove dead code ([6b38130](https://github.com/Konecty/konecty-sdk/commit/6b38130a1a2193e15505c5d02a91357094d10cdc))


### 💈 Style

* remove console.log ([a4d45a1](https://github.com/Konecty/konecty-sdk/commit/a4d45a17d69b59094ba9873cf98ca348cc174ef1))


### 📔 Docs

* add readme and licence ([7d05db1](https://github.com/Konecty/konecty-sdk/commit/7d05db1756469a05f54148546a51aca4b8c3da16))


### 🦊 CI/CD

* add semantic release config ([f8316ef](https://github.com/Konecty/konecty-sdk/commit/f8316efda393e159198f09420a87d5c5fe9d6695))
* ci config ([cf0ac21](https://github.com/Konecty/konecty-sdk/commit/cf0ac2183ace668ecc89d13d07edd9d0733ff7d8))


### 🧪 Tests

* update fixtures ([1470da1](https://github.com/Konecty/konecty-sdk/commit/1470da1be334eee90aa716a0d638cbd5dbe07e12))


### 🚀 Features

* build class command ([630010b](https://github.com/Konecty/konecty-sdk/commit/630010b853ef3cf4881c583d312a0345fd3c539b))
* create interface and docs command line ([bed6b7d](https://github.com/Konecty/konecty-sdk/commit/bed6b7d572187fcccae3c010649a71812aae5db7))
* type generator ([548764d](https://github.com/Konecty/konecty-sdk/commit/548764daae21fad9122abaec1688e8a69802b516))


### Other

* initial commit ([a89de78](https://github.com/Konecty/konecty-sdk/commit/a89de78467b60426538545346bf895c77801327f))
