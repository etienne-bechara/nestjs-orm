## [2.8.14](https://github.com/etienne-bechara/nestjs-orm/compare/v2.8.13...v2.8.14) (2021-05-29)


### Bug Fixes

* upsert remap with nested entities ([1146901](https://github.com/etienne-bechara/nestjs-orm/commit/11469019f9e8d749d8386b4bc390d7ba30208cad))

## [2.8.13](https://github.com/etienne-bechara/nestjs-orm/compare/v2.8.12...v2.8.13) (2021-05-29)


### Bug Fixes

* improve read performance for multiple upsert ([d38ad08](https://github.com/etienne-bechara/nestjs-orm/commit/d38ad08a27db09a486d977fdd5d44fe2bbd839ae))

## [2.8.12](https://github.com/etienne-bechara/nestjs-orm/compare/v2.8.11...v2.8.12) (2021-05-27)


### Bug Fixes

* add typing to unique key ([7a58d57](https://github.com/etienne-bechara/nestjs-orm/commit/7a58d57db9cb669fcb83fea0f75f7feef43c573e))

## [2.8.11](https://github.com/etienne-bechara/nestjs-orm/compare/v2.8.10...v2.8.11) (2021-05-26)


### Bug Fixes

* add more base entities options ([cf2c869](https://github.com/etienne-bechara/nestjs-orm/commit/cf2c869d4c68081ceb4ccd2812e142964d922fa8))

## [2.8.10](https://github.com/etienne-bechara/nestjs-orm/compare/v2.8.9...v2.8.10) (2021-05-26)


### Bug Fixes

* interrupt remove if no entity provided ([30dfaaa](https://github.com/etienne-bechara/nestjs-orm/commit/30dfaaadb3ba42a97fc45b7bb54afc48250ebc46))

## [2.8.9](https://github.com/etienne-bechara/nestjs-orm/compare/v2.8.8...v2.8.9) (2021-05-22)


### Bug Fixes

* match upsert entities asynchronously ([31c05df](https://github.com/etienne-bechara/nestjs-orm/commit/31c05dffd652f9c2165f4de2b4c048d0d4943039))

## [2.8.8](https://github.com/etienne-bechara/nestjs-orm/compare/v2.8.7...v2.8.8) (2021-05-22)


### Bug Fixes

* allow id to be numeric ([438616c](https://github.com/etienne-bechara/nestjs-orm/commit/438616c2645a19d3529b356e5657952588e1ff60))

## [2.8.7](https://github.com/etienne-bechara/nestjs-orm/compare/v2.8.6...v2.8.7) (2021-05-20)


### Bug Fixes

* change default sorting on readAndCount() to id column which should always exist ([9e369f9](https://github.com/etienne-bechara/nestjs-orm/commit/9e369f98410544afb4ba5dd9232ab05de4c4d814))

## [2.8.6](https://github.com/etienne-bechara/nestjs-orm/compare/v2.8.5...v2.8.6) (2021-05-20)


### Bug Fixes

* improve sync result response ([382d0e4](https://github.com/etienne-bechara/nestjs-orm/commit/382d0e483db84a139a0035fef74d70d5827ab0a7))

## [2.8.5](https://github.com/etienne-bechara/nestjs-orm/compare/v2.8.4...v2.8.5) (2021-05-19)


### Bug Fixes

* return migration queries ([9c061a5](https://github.com/etienne-bechara/nestjs-orm/commit/9c061a506080e96481712bc29b20841fb19b12f5))

## [2.8.4](https://github.com/etienne-bechara/nestjs-orm/compare/v2.8.3...v2.8.4) (2021-05-03)


### Bug Fixes

* fail if updating or removing by non-existing id ([ce2acc3](https://github.com/etienne-bechara/nestjs-orm/commit/ce2acc31fd601ac9aa981f078ad5a69d3e3e1a20))

## [2.8.3](https://github.com/etienne-bechara/nestjs-orm/compare/v2.8.2...v2.8.3) (2021-04-30)


### Bug Fixes

* bump rxjs ([6872b36](https://github.com/etienne-bechara/nestjs-orm/commit/6872b36dec054542e12e51006dff9f6305cc82a4))

## [2.8.2](https://github.com/etienne-bechara/nestjs-orm/compare/v2.8.1...v2.8.2) (2021-04-26)


### Bug Fixes

* hooks not triggering ([d72af86](https://github.com/etienne-bechara/nestjs-orm/commit/d72af86a7ca6cbfb67fb9f7c9d32c427e7123a92))

## [2.8.1](https://github.com/etienne-bechara/nestjs-orm/compare/v2.8.0...v2.8.1) (2021-04-26)


### Bug Fixes

* unnecessary upsert querying ([5546ade](https://github.com/etienne-bechara/nestjs-orm/commit/5546ade409bc05e51eba587b1684baacd91a8703))

# [2.8.0](https://github.com/etienne-bechara/nestjs-orm/compare/v2.7.0...v2.8.0) (2021-04-26)


### Features

* add wrapper for entity population and reload ([39bbe16](https://github.com/etienne-bechara/nestjs-orm/commit/39bbe16d963252aa4e3791ac3afc07ea6698db40))

# [2.7.0](https://github.com/etienne-bechara/nestjs-orm/compare/v2.6.2...v2.7.0) (2021-04-26)


### Bug Fixes

* do not force decorators into controller, adds full CRUD example ([336f26c](https://github.com/etienne-bechara/nestjs-orm/commit/336f26c19a636d3684f4b58cf7dfe2763c947125))


### Features

* allow read options into any method ([87fe370](https://github.com/etienne-bechara/nestjs-orm/commit/87fe3706ac2bdf7fc1d6c7a0272279bbd56a7399))

## [2.6.2](https://github.com/etienne-bechara/nestjs-orm/compare/v2.6.1...v2.6.2) (2021-04-24)


### Bug Fixes

* separate population options from service and controller ([840ea0b](https://github.com/etienne-bechara/nestjs-orm/commit/840ea0b0fe1961109bbe26fbed0a6fb38f71c339))

## [2.6.1](https://github.com/etienne-bechara/nestjs-orm/compare/v2.6.0...v2.6.1) (2021-04-24)


### Bug Fixes

* hook accessibility ([d563679](https://github.com/etienne-bechara/nestjs-orm/commit/d56367961184e6943da82d698d04b9decc724762))

# [2.6.0](https://github.com/etienne-bechara/nestjs-orm/compare/v2.5.4...v2.6.0) (2021-04-24)


### Features

* add hook functionality ([6327264](https://github.com/etienne-bechara/nestjs-orm/commit/6327264b289740b965d846718085eac2eb711e22))

## [2.5.4](https://github.com/etienne-bechara/nestjs-orm/compare/v2.5.3...v2.5.4) (2021-04-23)


### Bug Fixes

* change update params for consistency ([59dfd6a](https://github.com/etienne-bechara/nestjs-orm/commit/59dfd6ae5292eea59ec89579b0e7d7894959c2a3))

## [2.5.3](https://github.com/etienne-bechara/nestjs-orm/compare/v2.5.2...v2.5.3) (2021-04-23)


### Bug Fixes

* allow auto refresh after upsert ([5269392](https://github.com/etienne-bechara/nestjs-orm/commit/526939273d768c32493d80e8f22616a056839b9a))

## [2.5.2](https://github.com/etienne-bechara/nestjs-orm/compare/v2.5.1...v2.5.2) (2021-04-23)


### Bug Fixes

* populate collections before update diff ([41a67e8](https://github.com/etienne-bechara/nestjs-orm/commit/41a67e8cdb31f2eee6893faae3ae6f92e9f94897))

## [2.5.1](https://github.com/etienne-bechara/nestjs-orm/compare/v2.5.0...v2.5.1) (2021-04-23)


### Bug Fixes

* update one entity type ([28dc180](https://github.com/etienne-bechara/nestjs-orm/commit/28dc1806b51326c6bdfee5dbd3f2bc8c22f84f93))

# [2.5.0](https://github.com/etienne-bechara/nestjs-orm/compare/v2.4.0...v2.5.0) (2021-04-23)


### Bug Fixes

* change query logging to trace level ([c420bc5](https://github.com/etienne-bechara/nestjs-orm/commit/c420bc5b98b3e8c3fb497e1da2b59375a18eee4c))


### Features

* update methods to diferentitate batch operations from single ([b370b7d](https://github.com/etienne-bechara/nestjs-orm/commit/b370b7d74636c9efc1086acd5ba7adb355d7bdaa))

# [2.4.0](https://github.com/etienne-bechara/nestjs-orm/compare/v2.3.0...v2.4.0) (2021-04-23)


### Bug Fixes

* interface for multiple entities handling ([a7e9c01](https://github.com/etienne-bechara/nestjs-orm/commit/a7e9c01d1e01d4010d0e65c4ad203e5e7fdf6aa1))


### Features

* improve array support ([846509c](https://github.com/etienne-bechara/nestjs-orm/commit/846509c1c121d064d558da4e814388a07327a5b6))

# [2.3.0](https://github.com/etienne-bechara/nestjs-orm/compare/v2.2.7...v2.3.0) (2021-04-23)


### Features

* increase query performance and add fail option ([97324eb](https://github.com/etienne-bechara/nestjs-orm/commit/97324eb6df9bfac786f362d84c70c3e3191f26e4))
* support multiple entities at create, update and remove ([9238341](https://github.com/etienne-bechara/nestjs-orm/commit/92383415d71fe6b9785e353bdc3f81a72a820dc3))

## [2.2.7](https://github.com/etienne-bechara/nestjs-orm/compare/v2.2.6...v2.2.7) (2021-04-21)


### Bug Fixes

* assign default value to sync module ([0c51bc8](https://github.com/etienne-bechara/nestjs-orm/commit/0c51bc82d4f43d7dcf47d212eca665f1994f9bcc))

## [2.2.6](https://github.com/etienne-bechara/nestjs-orm/compare/v2.2.5...v2.2.6) (2021-04-21)


### Bug Fixes

* extend base mikro-orm instead of implementing again ([7deb911](https://github.com/etienne-bechara/nestjs-orm/commit/7deb9117147bb65a3f970150e51ebef8f6ae2c63))
* interface ([206678d](https://github.com/etienne-bechara/nestjs-orm/commit/206678dfaeaeb077a576ad764edec6bde6d4a3d3))

## [2.2.5](https://github.com/etienne-bechara/nestjs-orm/compare/v2.2.4...v2.2.5) (2021-04-21)


### Bug Fixes

* typo ([39948bb](https://github.com/etienne-bechara/nestjs-orm/commit/39948bb2bc564b5e4d7f77ab5222668a132d1fb9))

## [2.2.4](https://github.com/etienne-bechara/nestjs-orm/compare/v2.2.3...v2.2.4) (2021-04-21)


### Bug Fixes

* port typing ([a64b9a3](https://github.com/etienne-bechara/nestjs-orm/commit/a64b9a3b07970dbb8e104a7ff381409990e29f44))

## [2.2.3](https://github.com/etienne-bechara/nestjs-orm/compare/v2.2.2...v2.2.3) (2021-04-21)


### Bug Fixes

* set suggested configs as optional ([198d454](https://github.com/etienne-bechara/nestjs-orm/commit/198d454952b34209b1d9775c22c931fa92e81ff6))

## [2.2.2](https://github.com/etienne-bechara/nestjs-orm/compare/v2.2.1...v2.2.2) (2021-04-21)


### Bug Fixes

* make controller options optional ([c425955](https://github.com/etienne-bechara/nestjs-orm/commit/c425955acff4ddee10869396412e6d08392e5e23))

## [2.2.1](https://github.com/etienne-bechara/nestjs-orm/compare/v2.2.0...v2.2.1) (2021-04-21)


### Bug Fixes

* optional dto ([36f5d19](https://github.com/etienne-bechara/nestjs-orm/commit/36f5d193d6483efc73c5aef3a03fca995cb2e49f))

# [2.2.0](https://github.com/etienne-bechara/nestjs-orm/compare/v2.1.0...v2.2.0) (2021-04-21)


### Bug Fixes

* make dtos optional ([e9bdc0a](https://github.com/etienne-bechara/nestjs-orm/commit/e9bdc0a68330aaba062393fab07b82b3d14e2ade))


### Features

* make controllers easier to configure and add pathc by id ([a58615d](https://github.com/etienne-bechara/nestjs-orm/commit/a58615db210df44cca22daa02402402dee2c7361))

# [2.1.0](https://github.com/etienne-bechara/nestjs-orm/compare/v2.0.4...v2.1.0) (2021-04-20)


### Features

* add sync schema blacklist ([6a8ccdc](https://github.com/etienne-bechara/nestjs-orm/commit/6a8ccdc19ff5728c6281231cc43b5f145fd473d3))

## [2.0.4](https://github.com/etienne-bechara/nestjs-orm/compare/v2.0.3...v2.0.4) (2021-04-20)


### Bug Fixes

* ci publish ([815d649](https://github.com/etienne-bechara/nestjs-orm/commit/815d64948eb988806a307101af3012e61896130a))
* ci publish ([0e0bec9](https://github.com/etienne-bechara/nestjs-orm/commit/0e0bec9faf271e30e2ba143d711cfe0ebc2d4584))

## [2.0.3](https://github.com/etienne-bechara/nestjs-orm/compare/v2.0.2...v2.0.3) (2021-04-19)


### Bug Fixes

* better config organization ([6f5cf33](https://github.com/etienne-bechara/nestjs-orm/commit/6f5cf33cb4a02d58db9006132d5a4d87c4917503))
* lint ([b8ace23](https://github.com/etienne-bechara/nestjs-orm/commit/b8ace238ba9c02fbb32463dfd4f1fb1908a94ff9))

## [2.0.2](https://github.com/etienne-bechara/nestjs-orm/compare/v2.0.1...v2.0.2) (2021-04-13)


### Bug Fixes

* method naming convention ([e78208d](https://github.com/etienne-bechara/nestjs-orm/commit/e78208d79a8ddced96d243651ab3d35d6c42eaa5))
* throw on missing entity during readUnique ([8bcf10d](https://github.com/etienne-bechara/nestjs-orm/commit/8bcf10d8313e21c4a3f48afb64f9e517a9aeb4c8))

## [2.0.1](https://github.com/etienne-bechara/nestjs-orm/compare/v2.0.0...v2.0.1) (2021-04-09)


### Bug Fixes

* order by undefined ([1063ac1](https://github.com/etienne-bechara/nestjs-orm/commit/1063ac11b19351e3a256be367388020b65c7eef7))

# [2.0.0](https://github.com/etienne-bechara/nestjs-orm/compare/v1.1.2...v2.0.0) (2021-04-09)


### Bug Fixes

* sync major ver with core ([0eab3e9](https://github.com/etienne-bechara/nestjs-orm/commit/0eab3e99c004308d140d01719fd16900eca69638))


### BREAKING CHANGES

* sync major ver with core

## [1.1.2](https://github.com/etienne-bechara/nestjs-orm/compare/v1.1.1...v1.1.2) (2021-04-08)


### Bug Fixes

* query order ([98721f2](https://github.com/etienne-bechara/nestjs-orm/commit/98721f2006c24d03df118d4e5e2208ec4e034b04))

## [1.1.1](https://github.com/etienne-bechara/nestjs-orm/compare/v1.1.0...v1.1.1) (2021-04-08)


### Bug Fixes

* entity recursion elimation ([63321d7](https://github.com/etienne-bechara/nestjs-orm/commit/63321d75900e5d87eaeb69bf7ee758d925ddb8ab))

# [1.1.0](https://github.com/etienne-bechara/nestjs-orm/compare/v1.0.3...v1.1.0) (2021-04-08)


### Features

* allow default populate by id ([3a7ed30](https://github.com/etienne-bechara/nestjs-orm/commit/3a7ed301c2d860d59a7cf695dfb6ddfe6203609f))

## [1.0.3](https://github.com/etienne-bechara/nestjs-orm/compare/v1.0.2...v1.0.3) (2021-04-06)


### Bug Fixes

* glob require paths ([dbda3e9](https://github.com/etienne-bechara/nestjs-orm/commit/dbda3e9e0ef22f370cb6ca60494fe795a2c63036))

## [1.0.2](https://github.com/etienne-bechara/nestjs-orm/compare/v1.0.1...v1.0.2) (2021-04-03)


### Bug Fixes

* improve serializer explanation ([0d72332](https://github.com/etienne-bechara/nestjs-orm/commit/0d72332ea9fc4495f2ef66a97ee9e3acfdb111d3))
* improve upsert and add better examples ([fb46939](https://github.com/etienne-bechara/nestjs-orm/commit/fb46939aeddba51f878acc061a5b7263f82dfb5a))
* replace npm with pnpm ([f21b984](https://github.com/etienne-bechara/nestjs-orm/commit/f21b984307507e78f87c469b737cce7499984c11))

## [1.0.1](https://github.com/etienne-bechara/nestjs-orm/compare/v1.0.0...v1.0.1) (2021-03-29)


### Bug Fixes

* add overrides ([b73c9bf](https://github.com/etienne-bechara/nestjs-orm/commit/b73c9bf9125034147b391eb95a195cdb2b19a8dc))

# 1.0.0 (2021-03-27)


### Bug Fixes

* interface index ([031e083](https://github.com/etienne-bechara/nestjs-orm/commit/031e083bead49ff07f661d4dbce021241ff73de2))
* update injection configuration to be more clear ([7c4f4fa](https://github.com/etienne-bechara/nestjs-orm/commit/7c4f4fa1ef7528fd27187b88539fe2b8b75b2779))


### Features

* initial version ([08f261f](https://github.com/etienne-bechara/nestjs-orm/commit/08f261f9f59dddb59a25dd99b2aa52357055a3d0))
