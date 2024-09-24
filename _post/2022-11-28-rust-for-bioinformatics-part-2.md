---
title: 'Why use Rust for bioinformatics? Part 2: You can depend on me.'
author: Rob Patro
member: rob-p
category: blog
tags:
  - rust
  - programming
  - bioinformatics
  - tools
  - computer science
---

For part 2 in our "Why use Rust in bioinformatics?" series, I want to focus on one of my favorite parts of the Rust ecosystem, [Cargo](https://doc.rust-lang.org/stable/cargo/). In fact, there is so much to like about Cargo, that I won't even be able to cover that in a single post. Instead, I'll focus in this post mostly on the use of Cargo for dependency management and will likely return later to some of my favorite `cargo` commands / plugins (like [`clippy`](https://github.com/rust-lang/rust-clippy)).

#### What is Cargo?

Cargo is the package manager for Rust and, more than that, it's essentially the build system and _project management system_.  Cargo can be used to [initialize the skeleton for a new project](https://doc.rust-lang.org/cargo/commands/cargo-init.html), to [build your program's executables or libraries](https://doc.rust-lang.org/cargo/commands/build-commands.html), to [run your unit or integration tests](https://doc.rust-lang.org/cargo/commands/cargo-test.html), to [generate the documentation for your program](https://doc.rust-lang.org/cargo/commands/cargo-rustdoc.html), to [run benchmarks](https://doc.rust-lang.org/cargo/commands/cargo-bench.html), and to perform a host of other useful actions.

In fact, Cargo does so much that I'm not going to attempt to cover it all in this post.  There is entire [online book](https://doc.rust-lang.org/cargo/index.html) dedicated to Cargo, its use, and its capabilities.  Instead, I'm going to focus mostly on Cargo's function as a depndency / package manager.

So, before I go into details, the **TLDR** is that Cargo is an amazing, easy-to-use, powerful, and intuitive build system that makes pulling in dependencies trivial, provides mechanisms for semantic versioning-based dependency resolution, reproducible builds, and automatic upgrading of dependency versions.  More than build systems I've encountered in any other language, Cargo "just works", and it makes building projects in Rust, even those with substantial sets of dependencies, quick and easy.

#### Declaring dependencies with Cargo

Cargo relies on a [TOML](https://toml.io/en/) format file called `Cargo.toml` that describes certain metadata about your project, including its developers, what it does, how it is structured, its dependencies and its relevant compiler options.  At a high level, Cargo is a declarative system (it is possible to construct "imperative" build scripts — so-called `build.rs` files — but they are not needed for many projects), and _building your project is as simple as declaring what type of project it is, listing your dependencies and preferred compiler options, and running `cargo build --release`_.

As a non-trivial running example, I'll be using the `Cargo.toml` file from our [`alevin-fry`](https://github.com/COMBINE-lab/alevin-fry/) tool for single-cell and single-nucleus RNA-seq processing.  The first part of the file describes the package, including metadata like the package name, version, authors, etc.  Now, not all of these fields are strictly required, but it's nice to populate your `Cargo.toml` with relevant metadata that will make tracking and organizing it easier in the context of other packages.

```
[package]
name = "alevin-fry"
version = "0.8.0"
authors = [
  "Avi Srivastava <avi.srivastava@nyu.edu>",
  "Hirak Sarkar <hirak_sarkar@hms.harvard.edu>",
  "Dongze He <dhe17@umd.edu>",
  "Mohsen Zakeri <mzakeri@cs.umd.edu>",
  "Rob Patro <rob@cs.umd.edu>",
]
edition = "2021"
description = "A suite of tools for the rapid, accurate and memory-frugal processing single-cell and single-nucleus sequencing data."
license-file = "LICENSE"
readme = "README.md"
repository = "https://github.com/COMBINE-lab/alevin-fry"
homepage = "https://github.com/COMBINE-lab/alevin-fry"
documentation = "https://alevin-fry.readthedocs.io/en/latest/"
include = [
  "/libradicl/src/*.rs",
  "/src/*.rs",
  "/Cargo.toml",
  "/README.md",
  "/LICENSE",
  "/CONTRIBUTING.md",
  "/CODE_OF_CONDUCT.md",
]
keywords = [
  "single-cell",
  "preprocessing",
  "RNA-seq",
  "single-nucleus",
  "RNA-velocity",
]
categories = ["command-line-utilities", "science"]
```

Most of these fields are self-explanatory, and the syntax is quite straightforward. The entries are a series of key-value pairs, where the value can be a string, a list, or (as we'll see below) a nested key-value store.  Perhaps the only non self-explanatory key here is the `edition` key.  The idea of rust `edition`s are described [here](https://doc.rust-lang.org/edition-guide/editions/index.html), and they essentially describe small backwards incompatible language changes as well as certain default behaviors.  Currently "2021" is the most recent `edition` of rust, and that is what we set here.

The actual dependencies are declared in a section labeled — unexpectedly — as "dependencies".  A short excerpt is below:

```
[dependencies]
# for local development, look in the libradicl git repository
# but when published, pull the specified version
libradicl = { git = "https://github.com/COMBINE-lab/libradicl", version = "0.4.6" }
anyhow = "1.0.59"
arrayvec = "0.7.2"
ahash = "0.7.6"
bincode = "1.3.3"
bstr = "0.2.17"
```

This demonstrates several important details about the dependency management system exposed by Cargo.  The first thing is the simple manner in which dependencies are declared.  Each dependency is the name of a *crate* (the terminology that `Cargo` uses for dependencies), followed by a version constraint.  In general, Cargo crates follow semantic versioning, and the default syntax for declaring a compatible versions "X.Y.Z" means that you are willing to accept any version _compatible_ with "X.Y.Z".  So this would match, for example, "X.Y.(Z+1)" or "X.Y.(Z+2)", but not "X.(Y+1).Z".  You can also declare a constraint as "X.Y" which would allow "X.(Y+1).Z" but not "(X+1).Y.Z" etc. You can even declare dependencies as "X", which allows any version >=X and <(X+1).  The full syntax for specifying dependency constraints is quite powerful and flexible, and you can read more about it [here](https://doc.rust-lang.org/cargo/reference/specifying-dependencies.html).

The second thing to note is that some dependencies have a more complex description.  For example, the first dependency is `libradicl`, a library that we also developed that is hosted on GitHub as well as on `crates.io`.  You'll note that the declaration of the dependency lists two different sources, a `git` source and a `version` source.  This is a nice feature of Cargo.  When the program is built locally, it will pull the relevant dependency from the GitHub repository listed in the URL.  This allows one to develop coupled packages with ease, by allowing a program to always pull in its dependency with the latest commits directly from a remote (or local) repository.  Yet, when your package is later _published_ (more on that when we talk about `crates.io`), it can't rely on dependencies tracked in Git.  For that, you must instead declare a dependency on another crate that is hosted on `crates.io` — here, we rely on version 0.4.6 of the `libradicl` crate (or any version compatible with this declaration).  This leads to a fairly fluid development experience, where, when working on the `alevin-fry` tool, if we need to make a change to `libradicl`, we first make the changes upstream in GitHub (pulling directly from the repo during development).  Then, when we are satisfied with the changes that we wish to make, we push a new version to `crates.io`, and bump the `version` string in the `libradicl` dependency to this new version.  It's also worth noting the ease with which the [`release-please` GitHub action](https://github.com/google-github-actions/release-please-action) and [`rust` action](https://github.com/actions-rs/cargo) allows tagging a new version and automatically pushing the resulting release to `crates.io`.

If you look farther down in the `Cargo.toml` file, you'll notice that some other dependencies contained different invocations in their declarations. While the documentation provides a full accounting of how these different properties work, most of them are actually rather self-explanatory.  For example, the declaration below is a dependency on the brilliant `serde` serialization crate.  In addition to the version constraint, we also have a property `features = ["derive"]`. In rust, crates may have default and optional "features", these describe functionality that the crate can be built without or that it can provide.  Here, we are declaring that we wish to enable the "derive" feature of the `serde` crate (which lets us use the `derive` macro to quickly build out serialization and deserialization for the structs and types in our program).

```
serde = { version = "1.0.136", features = ["derive"] }
```

#### Declaring dependency version constraints

Cargo allows several ways to declare constraints on dependency versions.  The default behavior "X.Y.Z" is equivalent to the syntax "~X.Y.Z" which restricts the dependency from being satisfied by another version that makes breaking changes.  If you want or need to pin your dependency to a _specific_ version, you can use the syntax "=X.Y.Z", which will require pulling down exactly this version of the corresponding crate. There are many other types of constraints you can place on the dependencies (e.g. ">X.Y.Z", etc.).  These various constraints and how they work is documented nicely in [the book](https://doc.rust-lang.org/stable/cargo/reference/specifying-dependencies.html).

#### Resolving dependencies (and the Cargo.lock file)

When you ask Cargo to build your program, it will resolve the relevant dependencies, downloading the corresponding crates from `crates.io` (or other sources like GitHub if you have specified those) and building them to be linked with your program.  In the process of doing so, it's performing dependency resolution.  That is, it will find a corresponding set of versions that, given the current state of `crates.io` (i.e. the current set of available versions of all of the crates on which your program depends), satisfies all of the constraints on versions you requested. Generally, subject to these constraints, it pulls down the newest possible versions.  This behavior is great, because this means that if a corresponding crate updates their latest available version with something that is compatible (in terms of semantic versioning and your specified constrains), then you can get this updated version just by re-building your program.

Of course, there are situations where, for the purposes of reproducible builds, you may wish to be a bit more strict on how dependencies are resolved.  Cargo's way of allowing this is what is called the `Cargo.lock` file.  The contents of the `Cargo.lock` file look somewhat different than those of the `Cargo.toml` file (and they are generated by Cargo itself, so you're not responsible for making this), and [the book has a section on these](https://doc.rust-lang.org/cargo/guide/cargo-toml-vs-cargo-lock.html). For example, an entry from the `Cargo.lock` file for `alevin-fry` looks like this:

```
[[package]]
name = "anyhow"
version = "1.0.65"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "98161a4e3e2184da77bb14f02184cdd111e83bbbcc9979dfee3c44b9a85f5602"
```

This specifies the *specific* resolution for a dependency that was obtained during the solve when the program was built. When Cargo attempts to build your program, before it attempts to check the available upstream crate versions and resolve your program's dependencies, it first checks for the existence of a `Cargo.lock` file.  **If this file is present**, then it will simply use the versions declared therein (that is, it will re-use this "solve" of your set of dependencies).  One thing that's really nice about this is that it's possible to essentially "freeze" a build using the `Cargo.lock` file, such that, if some upstream dependency fails to properly use semantic versioning and makes a breaking change with a "patch" bump, builds that use the successful `Cargo.lock` file won't be affected.

The standard recommended practices around `Cargo.lock` files is actually something that I only learned relatively recently. Initially, I'd assumed that these generated files were essentially not for user consumption, and so I added the `Cargo.lock` files to my `.gitignore` list for my repositories and kept them out of version control (they are small, so this was for the purposes of keeping a clean file history rather than for worrying about repository size).  However, I since learned that recommended practice is basically the following: *If you are building a user-facing program or tool*, then you should include the `Cargo.lock` file in your version control and in your set of distributed source files; *On the other hand, if you are building a library* for other tools to pull in and depend upon, then you should generally not include the `Cargo.lock` file in your version control and distributed source files. Nonetheless, the `Cargo.lock` file is a neat solution to the problem of reproducible builds and solves.  Even when a specific dependency is "yanked" from `crates.io` (essentially, the authors of a crate can "unlist" a specific version of their crate), if you are in possession of the `Cargo.lock` file that solved using this yanked crate, your build will still be able to pull it down and compile against it.  In other words, even if certain versions of a crate are no longer publicly listed, the `Cargo.lock` file lets you re-create a build with the precise versions used before, making it easy to reproduce the set of dependencies of a previous build exactly.

#### Cargo-edit 

Cargo has a _plethora_ of different commands it exposes, many are built in and some come a "plugins" that expand the capabilities of Cargo. One particularly cool plugin that I wanted to mention is [`cargo-edit`](https://crates.io/crates/cargo-edit), and specifically, the `cargo upgrade` command. When your project has several dependencies, tracking and upgrading those dependencies can be a pain.  The `cargo-edit` plugin provides commands to help manage the contents of your `Cargo.toml` file, including the `add` command to add an entry for a new crate (given its name and the set of features you want), and to remove (`rm`) dependencies. It also includes a brilliant `upgrade` command that scans your list of dependencies, determines which can be safely upgraded, modifies your `Cargo.toml` accordingly, and also reports which packages can't be upgraded given your current versions and constraints. For example, running `cargo upgrade` on `alevin-fry` (as of commit `a77c96e162758e8cf5f4e509263216158bb580c9`) gives the following output: 

```
    Updating 'https://github.com/rust-lang/crates.io-index' index
    Checking alevin-fry's dependencies
name            old req compatible latest  new req note
====            ======= ========== ======  ======= ====
ahash           0.8.1   0.8.2      0.8.2   0.8.2
crossbeam-queue 0.3.6   0.3.8      0.3.8   0.3.8
flate2          1.0.24  1.0.25     1.0.25  1.0.25
serde           1.0.147 1.0.148    1.0.148 1.0.148
serde_json      1.0.87  1.0.89     1.0.89  1.0.89
snap            1.0.5   1.1.0      1.1.0   1.1.0
chrono          0.4.22  0.4.23     0.4.23  0.4.23
mimalloc        0.1.31  0.1.32     0.1.32  0.1.32
clap            =3.2.16 3.2.16     4.0.27  =3.2.16 pinned
   Upgrading recursive dependencies
note: Re-run with `--pinned` to upgrade pinned version requirements
note: Re-run with `--verbose` to show all dependencies
  unchanged: anyhow, arrayvec, bincode, bio-types, bstr, crossbeam-channel, csv, indicatif, itertools, libradicl, needletail, num-format, num_cpus, petgraph, rand, rust-htslib, sce, scroll, slog, slog-async, slog-term, smallvec, sprs, statrs, thiserror, typed-builder
```

So we see what the current upgradable dependency is, the latest compatible version, the latest version (ignoring compatibility), and version to which our dependency has been upgraded. Finally, as you can see in the case of the `clap` dependency, if you have specific constraints that preclude upgrading a crate, it will also include relevant notes. While the `upgrade` command will not perform version breaking upgrades by default, you can pass the `-i, --incompatible` option to allow upgrading to an incompatible version and the `-p, --package` argument to target a specific package.  The command also has a `--dry-run` flag to show you what upgrades would be made without actually performing them.

Overall, `cargo-edit` makes adding, removing, and upgrading your dependencies easy, by taking the monotonous grunt work out of parts of the process that really should be automated.

#### `crates.io` — The source for official dependencies

I have mentioned [`crates.io`](https://crates.io/) above many times.  It is the official registry for rust language crates (dependencies), and currently home to >98,000 different crates!  You can browse the crates by category or search for them by name. Moreover, when you start building your own libraries and tools, you can easily host them on `crates.io` for free. All you have to do is register and use the `cargo publish` command to upload your locally developed crate to the `crates.io` registry. After that, you (and others) can add dependencies on your crate simply by adding the appropriate declaration to your `Cargo.toml` file as we have discussed above.  In my opinion, one of the brilliant things about the rust ecosystem, is how the ease of both using _and publishing_ crates encourages the development of small, modular, and reusable components in rust software.  There are crates for a host of different purposes, and it's trivial to make your own. When you make a crate to serve a specific purpose, it is then easy to reuse it across many projects by simply declaring it as a dependency.  In my opinion, this works _much_ better than the alternatives in languages like C/C++, where it is common to either vendor your dependencies and copy (potentially different versions) into the source tree across many projects that use them.  While certain package management solutions for C++ exist, like [`conan`](https://conan.io/) and [`vcpkg`](https://vcpkg.io/en/index.html), these are all 3rd party solutions and they lack the scope and breadth of `cratres.io`, and also the tight and elegant integration with the rest of the development ecosystem that is enjoyed by `crates.io` and `cargo`. In my (admittedly biased) opinion, the dependency management solutions provided by rust are phenomenal, and probably the best among any language in which I've worked — and this includes non-compiled languages such as Python and R.

#### Some fun bioinformatics crates

I'll close this post by mentioning that a search for bioinformatics on `crates.io` turn up [156 results](https://crates.io/search?q=bioinformatics) (and related terms turn up more e.g. [genomics turns up 112](https://crates.io/search?q=genomics)).  I encourage you to go exploring yourself!  However, it is worth mentioning some common crates in the bioinformatics space that are pretty awesome:

* The [`bio` crate](https://crates.io/crates/bio) is a bioinformatics library for Rust that provides implementations of several critical data structures (e.g. the FM-index) algorithms (e.g. alignment) and parsers (e.g. GTF). It's a great place to start if you're looking for a crate that tackles many common problems

* The [`seq_io` crate](https://crates.io/crates/seq_io) is a particularly fast FASTA/Q parser. There are several such crates, so it's worth exploring the different options here.

* The [`rust-htslib` crate](https://crates.io/crates/rust-htslib) provides Rust bindings for the venerable [`htslib`](https://github.com/samtools/htslib) C library for reading and writing SAM/BAM/CRAM files.

* Related to the above, the [`noodles`](https://crates.io/crates/noodles) crate provides readers and writers for "BAM 1.6, BCF 2.2, BED, BGZF, CRAM 3.0, CSI, FASTA, FASTQ, GFF3, GTF 2.2, SAM 1.6, tabix, and VCF 4.3." written entirely in Rust (so no binding to an external C library). It's definitely a crate to keep an eye on in terms of native Rust support for these common file formats.

* The [`debruijn`](https://crates.io/crates/debruijn) crate from 10x genomics provides a de Bruijn graph implementation in Rust. In fact, 10x is quite prolific in terms of creating Rust crates in the bioinformatics space, many of which you can find [here](https://crates.io/teams/github:10xgenomics:crates_io) — including a [Rust implementation of the BBhash minimal perfect hashing algorithm](https://crates.io/crates/boomphf).

* If you're doing sequence alignment in Rust, definitely check out the [`block-aligner`](https://crates.io/crates/block-aligner) crate by [Daniel Liu](https://twitter.com/daniel_c0deb0t), for a high-performance, SIMD-accelerated, block-adaptive sequence alignment algorithm.

 This is in no way a comprehensive list, but I would *absolutely* appreciate feedback if there are crates that you use regularly that you'd like me to list here! There are already a ton of great *tools* in Rust in the bioinformatics space, but the list above is mostly for library-level / reusable components.
